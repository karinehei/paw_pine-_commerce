"use client";

import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductPrice } from "@/components/product/ProductPrice";
import { VariantSelector } from "@/components/product/VariantSelector";
import { formatDispatchWindow } from "@/lib/commerce/delivery";
import { defaultSelections, findVariant, optionStatesFor } from "@/lib/commerce/variants";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { clampQuantity } from "@/lib/security";
import type { Product } from "@/lib/commerce/types";

export function ProductPurchase({ product }: { product: Product }) {
  const [selected, setSelected] = useState(() => defaultSelections(product));
  const [quantity, setQuantity] = useState(1);
  const variant = useMemo(() => findVariant(product, selected), [product, selected]);
  const valueStates = useMemo(() => optionStatesFor(product, selected), [product, selected]);
  const maxQuantity = clampQuantity(99, variant?.quantityAvailable);
  const quantityForCart = clampQuantity(quantity, variant?.quantityAvailable);

  const stockLabel = variant
    ? variant.availableForSale
      ? variant.quantityAvailable !== null && variant.quantityAvailable <= 4
        ? `Only ${variant.quantityAvailable} left`
        : "In stock · ready to dispatch"
      : "This option is currently out of stock"
    : "That combination is not available";

  return (
    <div className="space-y-6">
      {variant ? (
        <ProductPrice
          price={variant.price}
          compareAtPrice={variant.compareAtPrice}
          className="text-lg"
        />
      ) : (
        <ProductPrice
          price={product.priceRange.minVariantPrice}
          compareAtPrice={product.compareAtPriceRange.minVariantPrice}
          className="text-lg"
        />
      )}
      <VariantSelector
        options={product.options}
        selected={selected}
        valueStates={valueStates}
        onChange={(name, value) => setSelected((current) => ({ ...current, [name]: value }))}
      />
      <div>
        <label htmlFor="quantity" className="text-sm text-muted">
          Quantity
        </label>
        <div className="mt-2 flex w-36 items-center border border-border">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="min-h-11 min-w-11 px-3"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            −
          </button>
          <input
            id="quantity"
            type="number"
            min={1}
            max={maxQuantity}
            value={quantityForCart}
            onChange={(event) =>
              setQuantity(clampQuantity(Number(event.target.value) || 1, variant?.quantityAvailable))
            }
            className="w-full border-0 bg-transparent text-center text-sm"
          />
          <button
            type="button"
            aria-label="Increase quantity"
            className="min-h-11 min-w-11 px-3"
            onClick={() =>
              setQuantity((value) => clampQuantity(value + 1, variant?.quantityAvailable))
            }
          >
            +
          </button>
        </div>
      </div>
      <p className="text-sm text-muted" aria-live="polite">
        {stockLabel}
      </p>
      <p className="text-sm text-muted">
        {variant?.availableForSale
          ? `Dispatch ${formatDispatchWindow()} · complimentary shipping over €${FREE_SHIPPING_THRESHOLD}.`
          : "We’ll email when this option returns."}
      </p>
      <AddToCartButton product={product} variant={variant} quantity={quantityForCart} />
    </div>
  );
}
