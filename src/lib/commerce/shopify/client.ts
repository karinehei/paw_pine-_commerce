import "server-only";

import { CommerceError } from "@/lib/commerce/errors";
import { getShopifyConfig } from "@/lib/env";
import {
  sanitiseBuyerIp,
  storefrontEndpoint,
  storefrontRequestHeaders,
  type StorefrontTokenKind,
} from "@/lib/commerce/shopify/config";
import { logStorefrontFailure, toStorefrontError } from "@/lib/commerce/shopify/log";

interface ShopifyGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
}

interface ShopifyFetchOptions {
  query: string;
  operation: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
  revalidate?: number;
}

function isProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

async function buyerIp(): Promise<string | undefined> {
  if (isProductionBuild()) {
    return undefined;
  }
  try {
    const { headers } = await import("next/headers");
    const store = await headers();
    return sanitiseBuyerIp(store.get("x-forwarded-for") ?? store.get("x-real-ip"));
  } catch {
    return undefined;
  }
}

async function postStorefront(
  endpoint: string,
  requestHeaders: Record<string, string>,
  body: string,
  cache?: RequestCache,
  revalidate = 60,
): Promise<Response> {
  return fetch(endpoint, {
    method: "POST",
    headers: requestHeaders,
    body,
    cache: cache ?? (revalidate === 0 ? "no-store" : undefined),
    next: cache === "no-store" || revalidate === 0 ? undefined : { revalidate },
  });
}

export async function shopifyFetch<T>({
  query,
  operation,
  variables,
  cache,
  revalidate = 60,
}: ShopifyFetchOptions): Promise<T> {
  const config = getShopifyConfig();
  if (!config) {
    throw new CommerceError("unavailable", "Shopify is not configured.");
  }

  const endpoint = storefrontEndpoint(config);
  const ip = await buyerIp();
  const body = JSON.stringify({ query, variables });
  let usedKind: StorefrontTokenKind = config.tokenKind;

  let response: Response;
  try {
    response = await postStorefront(
      endpoint,
      storefrontRequestHeaders(config, ip),
      body,
      cache,
      revalidate,
    );
  } catch {
    logStorefrontFailure({ operation, code: "network" });
    throw new CommerceError("network");
  }

  if (
    (response.status === 401 || response.status === 403) &&
    usedKind === "private"
  ) {
    logStorefrontFailure({
      operation,
      code: "unauthorized_retry_public",
      status: response.status,
      detail: "header=private",
    });
    try {
      usedKind = "public";
      response = await postStorefront(
        endpoint,
        storefrontRequestHeaders(config, undefined, "public"),
        body,
        "no-store",
        0,
      );
    } catch {
      logStorefrontFailure({ operation, code: "network" });
      throw new CommerceError("network");
    }
  }

  if (!response.ok) {
    throw toStorefrontError(operation, response.status, `header=${usedKind}`);
  }

  let payload: ShopifyGraphQLResponse<T>;
  try {
    payload = (await response.json()) as ShopifyGraphQLResponse<T>;
  } catch {
    logStorefrontFailure({ operation, code: "invalid_json", status: response.status });
    throw new CommerceError("unavailable");
  }

  if (payload.errors?.length) {
    const throttled = payload.errors.some(
      (error) => error.extensions?.code === "THROTTLED" || /throttl/i.test(error.message),
    );
    if (throttled) {
      logStorefrontFailure({ operation, code: "rate_limited" });
      throw new CommerceError("rate_limited");
    }
    logStorefrontFailure({
      operation,
      code: payload.errors[0]?.extensions?.code ?? "graphql_error",
    });
    if (!payload.data) {
      throw new CommerceError("unavailable");
    }
  }

  if (!payload.data) {
    logStorefrontFailure({ operation, code: "empty_data" });
    throw new CommerceError("unavailable");
  }

  return payload.data;
}
