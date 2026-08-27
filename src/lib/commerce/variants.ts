import type { Product, ProductVariant } from "@/lib/commerce/types";

export function findVariant(
  product: Product,
  selected: Record<string, string>,
): ProductVariant | undefined {
  if (product.variants.length === 1) {
    return product.variants[0];
  }

  return product.variants.find((variant) =>
    variant.selectedOptions.every((option) => selected[option.name] === option.value),
  );
}

export function defaultSelections(product: Product): Record<string, string> {
  const available = product.variants.find((variant) => variant.availableForSale);
  const source = available ?? product.variants[0];
  const selected: Record<string, string> = {};

  for (const option of source?.selectedOptions ?? []) {
    selected[option.name] = option.value;
  }

  return selected;
}
