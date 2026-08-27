import "server-only";

import type { CommerceMode } from "@/lib/commerce/types";
import { isShopifyApiVersion, normaliseShopifyDomain } from "@/lib/security";

export { getGtmId, getSiteUrl } from "@/lib/env-public";

export function getShopifyConfig(): {
  domain: string;
  token: string;
  version: string;
} | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  const version = process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || "2025-04";

  if (!domain || !token) {
    return null;
  }

  const normalised = normaliseShopifyDomain(domain);
  if (!normalised || !isShopifyApiVersion(version)) {
    return null;
  }

  return { domain: normalised, token, version };
}

export function getCommerceMode(): CommerceMode {
  return getShopifyConfig() ? "shopify" : "demo";
}

export function isShopifyMode(): boolean {
  return getCommerceMode() === "shopify";
}

