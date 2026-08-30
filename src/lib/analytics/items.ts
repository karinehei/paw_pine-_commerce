import { parseAmount, selectedOptionsLabel } from "@/lib/format";
import type { Cart, CartLine, Product, ProductVariant } from "@/lib/commerce/types";
import type { AnalyticsItem } from "@/lib/analytics/types";

export function itemFromProduct(
  product: Pick<
    Product,
    "handle" | "title" | "vendor" | "category" | "species" | "priceRange"
  >,
  variant?: ProductVariant,
  quantity = 1,
): AnalyticsItem {
  const money = variant?.price ?? product.priceRange.minVariantPrice;
  return {
    id: product.handle,
    handle: product.handle,
    name: product.title,
    brand: product.vendor,
    category: product.category,
    species: product.species,
    variant: variant
      ? selectedOptionsLabel(variant.selectedOptions, variant.title)
      : undefined,
    price: parseAmount(money),
    currency: money.currencyCode,
    quantity,
  };
}

export function itemFromCartLine(line: CartLine): AnalyticsItem {
  return {
    id: line.merchandise.product.handle,
    handle: line.merchandise.product.handle,
    name: line.merchandise.product.title,
    variant: selectedOptionsLabel(
      line.merchandise.selectedOptions,
      line.merchandise.title,
    ),
    price: parseAmount(line.merchandise.price),
    currency: line.merchandise.price.currencyCode,
    quantity: line.quantity,
  };
}

export function itemsFromCart(cart: Cart): AnalyticsItem[] {
  return cart.lines.map(itemFromCartLine);
}

export function itemFromWishlist(item: {
  handle: string;
  title: string;
  vendor: string;
  category: string;
  species: string;
  price: { amount: string; currencyCode: string };
}): AnalyticsItem {
  return {
    id: item.handle,
    handle: item.handle,
    name: item.title,
    brand: item.vendor,
    category: item.category,
    species: item.species,
    price: parseAmount(item.price),
    currency: item.price.currencyCode,
    quantity: 1,
  };
}
