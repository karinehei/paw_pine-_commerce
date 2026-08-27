import { isShopifyApiVersion, normaliseShopifyDomain } from "@/lib/security";

export const DEFAULT_STOREFRONT_API_VERSION = "2026-07";

export type StorefrontTokenKind = "private" | "public";

export interface ShopifyConfig {
  domain: string;
  token: string;
  version: string;
  tokenKind: StorefrontTokenKind;
}

export function resolveShopifyConfig(env: {
  SHOPIFY_STORE_DOMAIN?: string;
  SHOPIFY_STOREFRONT_PRIVATE_TOKEN?: string;
  SHOPIFY_STOREFRONT_ACCESS_TOKEN?: string;
  SHOPIFY_STOREFRONT_API_VERSION?: string;
}): ShopifyConfig | null {
  const domain = env.SHOPIFY_STORE_DOMAIN?.trim();
  const privateToken = env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN?.trim();
  const publicToken = env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  const token = privateToken || publicToken;
  const version =
    env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || DEFAULT_STOREFRONT_API_VERSION;

  if (!domain || !token) {
    return null;
  }

  const normalised = normaliseShopifyDomain(domain);
  if (!normalised || !isShopifyApiVersion(version)) {
    throw new Error("Shopify is misconfigured: store domain or API version is invalid.");
  }

  return {
    domain: normalised,
    token,
    version,
    tokenKind: privateToken ? "private" : "public",
  };
}

export function sanitiseBuyerIp(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const first = value.split(",")[0]?.trim() ?? "";
  if (!first || first.length > 45 || /[^0-9a-fA-F.:]/.test(first)) {
    return undefined;
  }
  return first;
}

export function storefrontRequestHeaders(
  config: ShopifyConfig,
  buyerIp?: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.tokenKind === "private") {
    headers["Shopify-Storefront-Private-Token"] = config.token;
    if (buyerIp) {
      headers["Shopify-Storefront-Buyer-IP"] = buyerIp;
    }
  } else {
    headers["X-Shopify-Storefront-Access-Token"] = config.token;
  }

  return headers;
}

export function storefrontEndpoint(config: ShopifyConfig): string {
  return `https://${config.domain}/api/${config.version}/graphql.json`;
}
