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

export type OptionValueState = "available" | "out_of_stock" | "invalid";

export function optionValueState(
  product: Product,
  selected: Record<string, string>,
  optionName: string,
  value: string,
): OptionValueState {
  const next = { ...selected, [optionName]: value };
  const match = findVariant(product, next);
  if (!match) {
    return "invalid";
  }
  return match.availableForSale ? "available" : "out_of_stock";
}

export function optionStatesFor(
  product: Product,
  selected: Record<string, string>,
): Record<string, Record<string, OptionValueState>> {
  const result: Record<string, Record<string, OptionValueState>> = {};
  for (const option of product.options) {
    const states: Record<string, OptionValueState> = {};
    for (const value of option.values) {
      states[value] = optionValueState(product, selected, option.name, value);
    }
    result[option.name] = states;
  }
  return result;
}
