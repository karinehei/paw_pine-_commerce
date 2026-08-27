import { parseAmount, selectedOptionsLabel } from "@/lib/format";
import type { Cart, Product, ProductVariant } from "@/lib/commerce/types";
import type { AnalyticsItem } from "@/lib/analytics/types";

export function itemFromProduct(
  product: Pick<Product, "handle" | "title" | "vendor" | "category" | "priceRange">,
  variant?: ProductVariant,
  quantity = 1,
): AnalyticsItem {
  return {
    item_id: product.handle,
    item_name: product.title,
    item_brand: product.vendor,
    item_category: product.category,
    item_variant: variant ? selectedOptionsLabel(variant.selectedOptions, variant.title) : undefined,
    price: parseAmount(variant?.price ?? product.priceRange.minVariantPrice),
    quantity,
  };
}

export function itemsFromCart(cart: Cart): AnalyticsItem[] {
  return cart.lines.map((line) => ({
    item_id: line.merchandise.product.handle,
    item_name: line.merchandise.product.title,
    item_variant: selectedOptionsLabel(line.merchandise.selectedOptions, line.merchandise.title),
    price: parseAmount(line.merchandise.price),
    quantity: line.quantity,
  }));
}
