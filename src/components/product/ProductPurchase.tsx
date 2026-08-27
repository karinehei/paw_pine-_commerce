"use client";

import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { VariantSelector } from "@/components/product/VariantSelector";
import { defaultSelections, findVariant } from "@/lib/commerce/variants";
import type { Product } from "@/lib/commerce/types";

export function ProductPurchase({ product }: { product: Product }) {
  const [selected, setSelected] = useState(() => defaultSelections(product));
  const [quantity, setQuantity] = useState(1);
  const variant = useMemo(() => findVariant(product, selected), [product, selected]);

  const unavailableValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const option of product.options) {
      result[option.name] = option.values.filter((value) => {
        const next = { ...selected, [option.name]: value };
        const match = findVariant(product, next);
        return !match?.availableForSale;
      });
    }
    return result;
  }, [product, selected]);

  const stockLabel = variant
    ? variant.availableForSale
      ? variant.quantityAvailable !== null && variant.quantityAvailable <= 4
        ? `Only ${variant.quantityAvailable} left`
        : "In stock, ready to ship"
      : "This option is currently unavailable"
    : "Select an option";

  return (
    <div className="space-y-6">
      <VariantSelector
        options={product.options}
        selected={selected}
        unavailableValues={unavailableValues}
        onChange={(name, value) => setSelected((current) => ({ ...current, [name]: value }))}
      />
      <div>
        <label htmlFor="quantity" className="text-sm text-muted">
          Quantity
        </label>
        <div className="mt-2 flex w-32 items-center border border-border">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="px-3 py-2"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            −
          </button>
          <input
            id="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            className="w-full border-0 bg-transparent text-center text-sm"
          />
          <button
            type="button"
            aria-label="Increase quantity"
            className="px-3 py-2"
            onClick={() => setQuantity((value) => value + 1)}
          >
            +
          </button>
        </div>
      </div>
      <p className="text-sm text-muted">{stockLabel}</p>
      <AddToCartButton product={product} variant={variant} quantity={quantity} />
    </div>
  );
}
