"use client";

import { useTransition } from "react";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useMessages } from "@/components/i18n/LocaleProvider";
import { useCart } from "@/components/cart/CartProvider";
import { ProductMedia } from "@/components/product/ProductMedia";
import { ProductPrice } from "@/components/product/ProductPrice";
import { removeCartItem, updateCartItem } from "@/lib/cart/actions";
import { track } from "@/lib/analytics/events";
import { selectedOptionsLabel } from "@/lib/format";
import type { CartLine } from "@/lib/commerce/types";

export function CartLineItem({ line }: { line: CartLine }) {
  const { setCart, announce } = useCart();
  const t = useMessages();
  const [pending, startTransition] = useTransition();

  function update(quantity: number) {
    startTransition(async () => {
      const cart = await updateCartItem(line.id, quantity);
      setCart(cart);
    });
  }

  function remove() {
    startTransition(async () => {
      const cart = await removeCartItem(line.id);
      track({
        name: "remove_from_cart",
        items: [
          {
            item_id: line.merchandise.product.handle,
            item_name: line.merchandise.product.title,
            quantity: line.quantity,
          },
        ],
      });
      announce(t.removedFromBag(line.merchandise.product.title));
      setCart(cart);
    });
  }

  return (
    <li className={`flex gap-4 ${pending ? "opacity-60" : ""}`}>
      <LocaleLink
        href={`/products/${line.merchandise.product.handle}`}
        tabIndex={-1}
        aria-hidden="true"
        className="bg-stone block h-24 w-20 shrink-0"
      >
        <ProductMedia
          product={line.merchandise.product}
          image={line.merchandise.image}
          sizes="80px"
        />
      </LocaleLink>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-3">
          <LocaleLink
            href={`/products/${line.merchandise.product.handle}`}
            className="font-medium"
          >
            {line.merchandise.product.title}
          </LocaleLink>
          <ProductPrice price={line.cost.totalAmount} className="text-sm" />
        </div>
        <p className="text-muted mt-1 text-sm">
          {selectedOptionsLabel(line.merchandise.selectedOptions, line.merchandise.title)}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="border-border flex items-center border">
            <button
              type="button"
              aria-label={t.decreaseQuantity}
              className="min-h-11 min-w-11 px-2"
              onClick={() => update(line.quantity - 1)}
            >
              −
            </button>
            <span className="min-w-6 text-center text-sm" aria-live="polite">
              {line.quantity}
            </span>
            <button
              type="button"
              aria-label={t.increaseQuantity}
              className="min-h-11 min-w-11 px-2"
              onClick={() => update(line.quantity + 1)}
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={remove}
            className="text-muted min-h-11 text-sm underline-offset-4 hover:underline"
          >
            {t.remove}
          </button>
        </div>
      </div>
    </li>
  );
}
