"use client";

import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { BackInStockForm } from "@/components/commerce/BackInStockForm";
import { ProductPrice } from "@/components/product/ProductPrice";
import { VariantSelector } from "@/components/product/VariantSelector";
import { formatDispatchWindow } from "@/lib/commerce/delivery";
import { defaultSelections, findVariant, optionStatesFor } from "@/lib/commerce/variants";
import { clampQuantity } from "@/lib/security";
import type { Product } from "@/lib/commerce/types";
import { useLocale, useMessages } from "@/components/i18n/LocaleProvider";
import { numberLocale } from "@/lib/i18n/config";

export function ProductPurchase({ product }: { product: Product }) {
  const [selected, setSelected] = useState(() => defaultSelections(product));
  const [quantity, setQuantity] = useState(1);
  const t = useMessages();
  const locale = numberLocale(useLocale());
  const variant = useMemo(() => findVariant(product, selected), [product, selected]);
  const valueStates = useMemo(
    () => optionStatesFor(product, selected),
    [product, selected],
  );
  const maxQuantity = clampQuantity(99, variant?.quantityAvailable);
  const quantityForCart = clampQuantity(quantity, variant?.quantityAvailable);

  const stockLabel = variant
    ? variant.availableForSale
      ? variant.quantityAvailable !== null && variant.quantityAvailable <= 4
        ? t.onlyLeft(variant.quantityAvailable)
        : t.inStockDispatch
      : t.optionOutOfStock
    : t.combinationUnavailable;

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
        onChange={(name, value) =>
          setSelected((current) => ({ ...current, [name]: value }))
        }
      />
      <div>
        <label htmlFor="quantity" className="text-muted text-sm">
          {t.quantity}
        </label>
        <div className="border-border mt-2 flex w-36 items-center border">
          <button
            type="button"
            aria-label={t.decreaseQuantity}
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
              setQuantity(
                clampQuantity(
                  Number(event.target.value) || 1,
                  variant?.quantityAvailable,
                ),
              )
            }
            className="w-full border-0 bg-transparent text-center text-sm"
          />
          <button
            type="button"
            aria-label={t.increaseQuantity}
            className="min-h-11 min-w-11 px-3"
            onClick={() =>
              setQuantity((value) => clampQuantity(value + 1, variant?.quantityAvailable))
            }
          >
            +
          </button>
        </div>
      </div>
      <p className="text-muted text-sm" aria-live="polite">
        {stockLabel}
      </p>
      <p className="text-muted text-sm">
        {variant?.availableForSale
          ? t.dispatchOver(formatDispatchWindow(new Date(), locale))
          : t.emailWhenBack}
      </p>
      <AddToCartButton product={product} variant={variant} quantity={quantityForCart} />
      {variant && !variant.availableForSale ? (
        <BackInStockForm
          key={variant.id}
          handle={product.handle}
          variantId={variant.id}
        />
      ) : null}
    </div>
  );
}
