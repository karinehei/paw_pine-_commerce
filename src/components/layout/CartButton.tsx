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
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center"
      aria-label={t.openBag(count)}
    >
      <span className="hidden text-sm tracking-[0.12em] uppercase md:inline">
        {t.bag}
      </span>
      <svg
        className="md:hidden"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path d="M6 7h12l-1 12H7L6 7Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 7V6a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {count > 0 ? (
        <span className="bg-pine text-paper md:text-ink absolute -top-0.5 -right-0.5 min-w-4 px-1 text-center text-[0.65rem] leading-4 md:static md:ml-1 md:min-w-0 md:bg-transparent md:px-0 md:text-sm md:leading-normal">
          <span className="md:hidden">{count}</span>
          <span className="hidden md:inline">({count})</span>
        </span>
      ) : null}
    </button>
  );
}
