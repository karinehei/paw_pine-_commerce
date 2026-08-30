import type { Product } from "@/lib/commerce/types";

export type BackInStockEligibility = "ok" | "not_found" | "in_stock";

export function backInStockEligibility(
  product: Product | null,
  variantId?: string,
): BackInStockEligibility {
  if (!product) {
    return "not_found";
  }
  if (variantId) {
    const variant = product.variants.find((item) => item.id === variantId);
    if (!variant) {
      return "not_found";
    }
    return variant.availableForSale ? "in_stock" : "ok";
  }
  return product.availableForSale ? "in_stock" : "ok";
}
