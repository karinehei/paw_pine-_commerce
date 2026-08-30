"use client";

import { useCart } from "@/components/cart/CartProvider";
import { useMessages } from "@/components/i18n/LocaleProvider";

export function CartButton() {
  const { cart, openCart } = useCart();
  const t = useMessages();
  const count = cart?.totalQuantity ?? 0;

  return (
    <button
      type="button"
      onClick={openCart}
      className="min-h-11 text-sm tracking-[0.12em] uppercase"
      aria-label={t.openBag(count)}
    >
      {t.bag}
      {count > 0 ? ` (${count})` : ""}
    </button>
  );
}
