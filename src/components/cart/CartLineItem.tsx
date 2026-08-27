"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { ProductMedia } from "@/components/product/ProductMedia";
import { ProductPrice } from "@/components/product/ProductPrice";
import { removeCartItem, updateCartItem } from "@/lib/cart/actions";
import { track } from "@/lib/analytics/events";
import { selectedOptionsLabel } from "@/lib/format";
import type { CartLine } from "@/lib/commerce/types";

export function CartLineItem({ line }: { line: CartLine }) {
  const { setCart } = useCart();
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
      setCart(cart);
    });
  }

  return (
    <li className={`flex gap-4 ${pending ? "opacity-60" : ""}`}>
      <Link
        href={`/products/${line.merchandise.product.handle}`}
        tabIndex={-1}
        aria-hidden="true"
        className="block h-24 w-20 shrink-0 bg-stone"
      >
        <ProductMedia
          product={line.merchandise.product}
          image={line.merchandise.image}
          sizes="80px"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-3">
          <Link href={`/products/${line.merchandise.product.handle}`} className="font-medium">
            {line.merchandise.product.title}
          </Link>
          <ProductPrice price={line.cost.totalAmount} className="text-sm" />
        </div>
        <p className="mt-1 text-sm text-muted">
          {selectedOptionsLabel(line.merchandise.selectedOptions, line.merchandise.title)}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              className="px-2 py-1"
              onClick={() => update(line.quantity - 1)}
            >
              −
            </button>
            <span className="min-w-6 text-center text-sm">{line.quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              className="px-2 py-1"
              onClick={() => update(line.quantity + 1)}
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={remove}
            className="text-sm text-muted underline-offset-4 hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
