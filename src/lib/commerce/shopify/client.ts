import "server-only";

import { CommerceError } from "@/lib/commerce/errors";
import { getShopifyConfig } from "@/lib/env";

interface ShopifyGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
}

interface ShopifyFetchOptions {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
  revalidate?: number;
}

export async function shopifyFetch<T>({
  query,
  variables,
  cache,
  revalidate = 60,
}: ShopifyFetchOptions): Promise<T> {
  const config = getShopifyConfig();
  if (!config) {
    throw new CommerceError("unavailable", "Shopify is not configured.");
  }

  const endpoint = `https://${config.domain}/api/${config.version}/graphql.json`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": config.token,
      },
      body: JSON.stringify({ query, variables }),
      cache: cache ?? (revalidate === 0 ? "no-store" : undefined),
      next: cache === "no-store" || revalidate === 0 ? undefined : { revalidate },
    });
  } catch {
    throw new CommerceError("network");
  }

  if (response.status === 429) {
    throw new CommerceError("rate_limited");
  }

  if (!response.ok) {
    throw new CommerceError("unavailable");
  }

  let payload: ShopifyGraphQLResponse<T>;
  try {
    payload = (await response.json()) as ShopifyGraphQLResponse<T>;
  } catch {
    throw new CommerceError("unavailable");
  }

  if (payload.errors?.length) {
    const throttled = payload.errors.some(
      (error) => error.extensions?.code === "THROTTLED" || /throttl/i.test(error.message),
    );
    if (throttled) {
      throw new CommerceError("rate_limited");
    }
    throw new CommerceError("unavailable");
  }

  if (!payload.data) {
    throw new CommerceError("unavailable");
  }

  return payload.data;
}
