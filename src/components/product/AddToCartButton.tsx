"use client";

import { useState, useTransition } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { addItemToCart } from "@/lib/cart/actions";
import { track } from "@/lib/analytics/events";
import { itemFromProduct } from "@/lib/analytics/items";
import { parseAmount } from "@/lib/format";
import { toUserErrorMessage } from "@/lib/commerce/errors";
import { useLocale, useMessages } from "@/components/i18n/LocaleProvider";
import type { Product, ProductVariant } from "@/lib/commerce/types";

interface AddToCartButtonProps {
  product: Product;
  variant: ProductVariant | undefined;
  quantity: number;
}

export function AddToCartButton({ product, variant, quantity }: AddToCartButtonProps) {
  const { setCart, openCart, announce } = useCart();
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
    startTransition(async () => {
      try {
        const cart = await addItemToCart(variant.id, quantity);
        setCart(cart);
        const item = itemFromProduct(product, variant, quantity);
        track({
          name: "add_to_cart",
          currency: variant.price.currencyCode,
          value: parseAmount(variant.price) * quantity,
          items: [item],
        });
        announce(t.addedToBag(product.title));
        openCart();
      } catch (caught) {
        setError(toUserErrorMessage(caught, locale));
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={unavailable || pending}
        className="btn-primary disabled:bg-stone disabled:text-muted w-full disabled:cursor-not-allowed"
      >
        {unavailable ? t.outOfStock : pending ? t.adding : t.addToBag}
      </button>
      {error ? <p className="text-sale text-sm">{error}</p> : null}
    </div>
  );
}
