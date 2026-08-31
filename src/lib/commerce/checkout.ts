import type { CommerceMode } from "@/lib/commerce/types";
import { isShopifyCheckoutUrl } from "@/lib/security";

export function shopifyCheckoutHopPath(checkoutUrl: string): string {
  return `/checkout?to=${encodeURIComponent(checkoutUrl)}`;
}

export function parseCheckoutTarget(value: string | undefined): string | null {
  if (!value || !isShopifyCheckoutUrl(value)) {
    return null;
  }
  return value;
}

export function resolveCheckoutHref(
  mode: CommerceMode,
  checkoutUrl: string | undefined,
): { href: string; external: boolean } {
  if (mode === "shopify" && checkoutUrl && isShopifyCheckoutUrl(checkoutUrl)) {
    return { href: shopifyCheckoutHopPath(checkoutUrl), external: false };
  }

  return { href: "/cart?checkout=demo", external: false };
}
