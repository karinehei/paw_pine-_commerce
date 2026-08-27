"use client";

import Link from "next/link";
import { track } from "@/lib/analytics/events";
import { itemsFromCart } from "@/lib/analytics/items";
import { parseAmount } from "@/lib/format";
import type { Cart } from "@/lib/commerce/types";

export function CheckoutCta({
  cart,
  href,
  external,
}: {
  cart: Cart;
  href: string;
  external: boolean;
}) {
  function onClick() {
    track({
      name: "begin_checkout",
      currency: cart.cost.subtotalAmount.currencyCode,
      value: parseAmount(cart.cost.subtotalAmount),
      items: itemsFromCart(cart),
    });
  }

  const className = "btn-primary w-full";

  if (external) {
    return (
      <a href={href} rel="noopener noreferrer" onClick={onClick} className={className}>
        Checkout
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      Checkout
    </Link>
  );
}
