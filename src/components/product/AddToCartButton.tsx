"use client";

import { useState, useTransition } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { addItemToCart } from "@/lib/cart/client";
import { track } from "@/lib/analytics/events";
import { itemFromProduct } from "@/lib/analytics/items";
import { parseAmount } from "@/lib/format";
import { messageForCommerceCode } from "@/lib/commerce/errors";
import { useLocale, useMessages } from "@/components/i18n/LocaleProvider";
import type { Product, ProductVariant } from "@/lib/commerce/types";

interface AddToCartButtonProps {
  product: Product;
  variant: ProductVariant | undefined;
  quantity: number;
  fullWidth?: boolean;
}

export function AddToCartButton({
  product,
  variant,
  quantity,
  fullWidth = true,
}: AddToCartButtonProps) {
  const { setCart, openCart, closeCart, announce } = useCart();
  const t = useMessages();
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const unavailable = !variant || !variant.availableForSale;

  function handleClick() {
    if (!variant || unavailable) {
      return;
    }

    setError(null);
    openCart();
    startTransition(async () => {
      try {
        const result = await addItemToCart(locale, variant.id, quantity);
        if (!result.ok) {
          closeCart();
          setError(messageForCommerceCode(result.code, locale));
          return;
        }
        setCart(result.cart);
        const item = itemFromProduct(product, variant, quantity);
        track({
          name: "add_to_cart",
          currency: variant.price.currencyCode,
          value: parseAmount(variant.price) * quantity,
          items: [item],
        });
        announce(t.addedToBag(product.title));
      } catch {
        closeCart();
        setError(messageForCommerceCode("unavailable", locale));
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={unavailable || pending}
        className={`btn-primary disabled:bg-stone disabled:text-muted disabled:cursor-not-allowed ${
          fullWidth ? "w-full" : "min-w-40"
        }`}
      >
        {unavailable ? t.outOfStock : pending ? t.adding : t.addToBag}
      </button>
      {error ? <p className="text-sale text-sm">{error}</p> : null}
    </div>
  );
}
