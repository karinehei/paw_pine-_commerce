import "server-only";

import type { CommerceMode } from "@/lib/commerce/types";

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

  const normalised = domain
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .replace(/\.myshopify\.com.*/i, ".myshopify.com");

  return { domain: normalised, token, version };
}

export function getCommerceMode(): CommerceMode {
  return getShopifyConfig() ? "shopify" : "demo";
}

export function isShopifyMode(): boolean {
  return getCommerceMode() === "shopify";
}

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!url) {
    return "http://localhost:3000";
  }
  return url.replace(/\/$/, "");
}

export function getGtmId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  return id || undefined;
}
