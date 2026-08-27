import "server-only";

import type { CommerceMode } from "@/lib/commerce/types";
import { resolveShopifyConfig, type ShopifyConfig } from "@/lib/commerce/shopify/config";

export { getGtmId, getSiteUrl } from "@/lib/env-public";

export function getShopifyConfig(): ShopifyConfig | null {
  return resolveShopifyConfig({
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    SHOPIFY_STOREFRONT_PRIVATE_TOKEN: process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    SHOPIFY_STOREFRONT_API_VERSION: process.env.SHOPIFY_STOREFRONT_API_VERSION,
  });
}

export function getCommerceMode(): CommerceMode {
  return getShopifyConfig() ? "shopify" : "demo";
}

export function isShopifyMode(): boolean {
  return getCommerceMode() === "shopify";
}
