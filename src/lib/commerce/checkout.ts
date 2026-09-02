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
): { href: string; hardNavigation: boolean } {
  if (mode === "shopify" && checkoutUrl && isShopifyCheckoutUrl(checkoutUrl)) {
    // Document navigation: Next.js Link inside <dialog> stays on the PDP in Chrome.
    return { href: shopifyCheckoutHopPath(checkoutUrl), hardNavigation: true };
  }

  return { href: "/cart?checkout=demo", hardNavigation: false };
}
