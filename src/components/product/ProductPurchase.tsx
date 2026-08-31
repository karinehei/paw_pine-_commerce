"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { BackInStockForm } from "@/components/commerce/BackInStockForm";
import { ProductPrice } from "@/components/product/ProductPrice";
import { VariantSelector } from "@/components/product/VariantSelector";
import { formatDispatchWindow } from "@/lib/commerce/delivery";
import { defaultSelections, findVariant, optionStatesFor } from "@/lib/commerce/variants";
import { formatMoney } from "@/lib/format";
import { clampQuantity } from "@/lib/security";
import type { Product } from "@/lib/commerce/types";
import { useLocale, useMessages } from "@/components/i18n/LocaleProvider";
import { numberLocale } from "@/lib/i18n/config";

export function ProductPurchase({ product }: { product: Product }) {
  const [selected, setSelected] = useState(() => defaultSelections(product));
  const [quantity, setQuantity] = useState(1);
  const t = useMessages();
  const locale = numberLocale(useLocale());
  const ctaRef = useRef<HTMLDivElement>(null);
  const [sticky, setSticky] = useState(false);
  const variant = useMemo(() => findVariant(product, selected), [product, selected]);
  const valueStates = useMemo(
    () => optionStatesFor(product, selected),
    [product, selected],
  );
  const maxQuantity = clampQuantity(99, variant?.quantityAvailable);
  const quantityForCart = clampQuantity(quantity, variant?.quantityAvailable);

  const stockLabel = variant
    ? variant.availableForSale
      ? t.inStockDispatch
      : t.optionOutOfStock
    : t.combinationUnavailable;

  useEffect(() => {
    const node = ctaRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setSticky(Boolean(entry && !entry.isIntersecting)),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-6">
      {variant ? (
        <ProductPrice
          price={variant.price}
          compareAtPrice={variant.compareAtPrice}
          className="text-lg"
          showSavings
        />
      ) : (
        <ProductPrice
          price={product.priceRange.minVariantPrice}
          compareAtPrice={product.compareAtPriceRange.minVariantPrice}
          className="text-lg"
          showSavings
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
      {variant?.availableForSale ? (
        <p className="text-muted text-sm">
          {t.dispatchOver(formatDispatchWindow(new Date(), locale))}
        </p>
      ) : (
        <p className="text-muted text-sm">{t.emailWhenBack}</p>
      )}
      <div ref={ctaRef} id="product-purchase-cta">
        <AddToCartButton product={product} variant={variant} quantity={quantityForCart} />
      </div>
      {variant && !variant.availableForSale ? (
        <BackInStockForm
          key={variant.id}
          handle={product.handle}
          variantId={variant.id}
        />
      ) : null}
      {sticky && variant?.availableForSale ? (
        <div className="border-border bg-linen/95 supports-[backdrop-filter]:bg-linen/90 fixed inset-x-0 bottom-0 z-20 border-t px-4 py-3 backdrop-blur-sm lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <p className="min-w-0 flex-1 truncate text-sm">
              {formatMoney(variant.price, locale)}
            </p>
            <div className="shrink-0">
              <AddToCartButton
                product={product}
                variant={variant}
                quantity={quantityForCart}
                fullWidth={false}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
