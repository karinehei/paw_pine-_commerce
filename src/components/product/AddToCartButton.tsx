"use client";

import { useState, useTransition } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { addItemToCart } from "@/lib/cart/actions";
import { track } from "@/lib/analytics/events";
import { itemFromProduct } from "@/lib/analytics/items";
import { parseAmount } from "@/lib/format";
import { toUserErrorMessage } from "@/lib/commerce/errors";
import type { Product, ProductVariant } from "@/lib/commerce/types";

interface AddToCartButtonProps {
  product: Product;
  variant: ProductVariant | undefined;
  quantity: number;
}

export function AddToCartButton({ product, variant, quantity }: AddToCartButtonProps) {
  const { setCart, openCart, announce } = useCart();
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
        announce(`${product.title} added to bag`);
        openCart();
      } catch (caught) {
        setError(toUserErrorMessage(caught));
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={unavailable || pending}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:bg-stone disabled:text-muted"
      >
        {unavailable ? "Out of stock" : pending ? "Adding…" : "Add to bag"}
      </button>
      {error ? <p className="text-sm text-sale">{error}</p> : null}
    </div>
  );
}
