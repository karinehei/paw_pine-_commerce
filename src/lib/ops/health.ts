export const SHOPIFY_HEALTH_TIMEOUT_MS = 2500;

export type HealthStatus = "ok" | "degraded";
export type ShopifyDependencyStatus = "ok" | "error" | "not_configured";

export interface HealthReport {
  status: HealthStatus;
  dependencies: {
    shopify: ShopifyDependencyStatus;
  };
}

export function healthFromShopifyStatus(shopify: ShopifyDependencyStatus): HealthReport {
  if (shopify === "error") {
    return { status: "degraded", dependencies: { shopify } };
  }
  return { status: "ok", dependencies: { shopify } };
}

export function httpStatusForHealth(report: HealthReport): number {
  return report.status === "ok" ? 200 : 503;
}

interface StorefrontProbeInput {
  endpoint: string;
  headers: Record<string, string>;
  query: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/**
 * Small Storefront request. Returns ok/error only — never shop ids, bodies, or tokens.
 */
export async function probeShopifyStorefront({
  endpoint,
  headers,
  query,
  timeoutMs = SHOPIFY_HEALTH_TIMEOUT_MS,
  fetchImpl = fetch,
}: StorefrontProbeInput): Promise<"ok" | "error"> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return "error";
    }

    let payload: {
      data?: { shop?: { id?: unknown } | null };
      errors?: unknown[];
    };
    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      return "error";
    }

    if (payload.errors?.length && !payload.data?.shop) {
      return "error";
    }
    if (!payload.data?.shop) {
      return "error";
    }
    return "ok";
  } catch {
    return "error";
  } finally {
    clearTimeout(timer);
  }
}
