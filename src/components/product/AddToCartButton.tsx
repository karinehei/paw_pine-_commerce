"use client";

import { useState, useTransition } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { addItemToCart } from "@/lib/cart/actions";
import { track } from "@/lib/analytics/events";
import { parseAmount } from "@/lib/format";
import { toUserErrorMessage } from "@/lib/commerce/errors";
import type { Product, ProductVariant } from "@/lib/commerce/types";

interface AddToCartButtonProps {
  product: Product;
  variant: ProductVariant | undefined;
  quantity: number;
}

export function AddToCartButton({ product, variant, quantity }: AddToCartButtonProps) {
  const { setCart, openCart } = useCart();
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
        track({
          name: "add_to_cart",
          currency: variant.price.currencyCode,
          value: parseAmount(variant.price) * quantity,
          items: [
            {
              item_id: product.handle,
              item_name: product.title,
              item_brand: product.vendor,
              item_category: product.category,
              price: parseAmount(variant.price),
              quantity,
            },
          ],
        });
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
        className="w-full bg-pine px-6 py-3.5 text-sm tracking-[0.14em] text-paper uppercase transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:bg-stone disabled:text-muted"
      >
        {unavailable ? "Out of stock" : pending ? "Adding…" : "Add to bag"}
      </button>
      {error ? <p className="text-sm text-sale">{error}</p> : null}
    </div>
  );
}
