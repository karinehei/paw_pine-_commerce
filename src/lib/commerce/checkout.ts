import type { CommerceMode } from "@/lib/commerce/types";
import { isShopifyCheckoutUrl } from "@/lib/security";

export function resolveCheckoutHref(
  mode: CommerceMode,
  checkoutUrl: string | undefined,
): { href: string; external: boolean } {
  if (mode === "shopify" && checkoutUrl && isShopifyCheckoutUrl(checkoutUrl)) {
    return { href: checkoutUrl, external: true };
  }

  return { href: "/cart?checkout=demo", external: false };
}
