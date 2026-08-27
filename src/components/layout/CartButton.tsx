"use client";

import { useCart } from "@/components/cart/CartProvider";

export function CartButton() {
  const { cart, openCart } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <button
      type="button"
      onClick={openCart}
      className="min-h-11 text-sm tracking-[0.12em] uppercase"
      aria-label={`Open bag, ${count} items`}
    >
      Bag{count > 0 ? ` (${count})` : ""}
    </button>
  );
}
