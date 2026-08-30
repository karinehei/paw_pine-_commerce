"use client";

import { useEffect, useRef } from "react";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useLocale, useMessages } from "@/components/i18n/LocaleProvider";
import { numberLocale } from "@/lib/i18n/config";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { track } from "@/lib/analytics/events";
import { itemsFromCart } from "@/lib/analytics/items";
import { resolveCheckoutHref } from "@/lib/commerce/checkout";
import { ESTIMATED_SHIPPING_AMOUNT, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { formatMoney, moneyFromNumber, parseAmount } from "@/lib/format";

export function CartDrawer() {
  const { cart, isOpen, closeCart, mode } = useCart();
  const t = useMessages();
  const moneyLocale = numberLocale(useLocale());
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const trackedOpen = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (isOpen && !dialog.open) {
      dialog.showModal();
      closeRef.current?.focus();
    }
    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && cart && !trackedOpen.current) {
      trackedOpen.current = true;
      track({
        name: "view_cart",
        currency: cart.cost.subtotalAmount.currencyCode,
        value: parseAmount(cart.cost.subtotalAmount),
        items: itemsFromCart(cart),
      });
    }
    if (!isOpen) {
      trackedOpen.current = false;
    }
  }, [isOpen, cart]);

  useEffect(() => {
    closeCart();
  }, [pathname, closeCart]);

  const subtotal = cart ? parseAmount(cart.cost.subtotalAmount) : 0;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const checkout = resolveCheckoutHref(mode, cart?.checkoutUrl);

  function beginCheckout() {
    if (!cart) {
      return;
    }
    track({
      name: "begin_checkout",
      currency: cart.cost.subtotalAmount.currencyCode,
      value: parseAmount(cart.cost.subtotalAmount),
      items: itemsFromCart(cart),
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={closeCart}
      aria-labelledby="cart-drawer-title"
      className="bg-paper text-ink backdrop:bg-ink/40 fixed inset-y-0 right-0 m-0 ml-auto h-full max-h-none w-full max-w-md border-0 p-0 shadow-2xl"
    >
      <div className="flex h-full flex-col">
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <h2 id="cart-drawer-title" className="font-display text-2xl">
            {t.bag}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            className="text-muted min-h-11 text-sm"
          >
            {t.close}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {!cart || cart.lines.length === 0 ? (
            <EmptyState
              title={t.emptyBagTitle}
              description={t.emptyBagDrawer}
              action={{ href: "/collections/all", label: t.continueBrowsing }}
            />
          ) : (
            <ul className="space-y-5">
              {cart.lines.map((line) => (
                <CartLineItem key={line.id} line={line} />
              ))}
            </ul>
          )}
        </div>
        {cart && cart.lines.length > 0 ? (
          <div className="border-border space-y-3 border-t px-5 py-5">
            <p className="text-muted text-sm">
              {remaining > 0
                ? t.shippingAway(
                    formatMoney(
                      moneyFromNumber(remaining, cart.cost.subtotalAmount.currencyCode),
                      moneyLocale,
                    ),
                  )
                : t.shippingComplimentary}
            </p>
            <div className="flex justify-between text-sm">
              <span>{t.subtotal}</span>
              <span>{formatMoney(cart.cost.subtotalAmount, moneyLocale)}</span>
            </div>
            <p className="text-muted text-xs">
              {t.shippingEstimateDrawer(
                formatMoney(
                  moneyFromNumber(
                    remaining > 0 ? ESTIMATED_SHIPPING_AMOUNT : 0,
                    cart.cost.subtotalAmount.currencyCode,
                  ),
                  moneyLocale,
                ),
              )}
            </p>
            {checkout.external ? (
              <a
                href={checkout.href}
                rel="noopener noreferrer"
                onClick={beginCheckout}
                className="btn-primary w-full"
              >
                {t.checkout}
              </a>
            ) : (
              <LocaleLink
                href={checkout.href}
                onClick={() => {
                  beginCheckout();
                  closeCart();
                }}
                className="btn-primary w-full"
              >
                {t.checkout}
              </LocaleLink>
            )}
            <LocaleLink
              href="/cart"
              onClick={closeCart}
              className="text-muted block min-h-11 text-center text-sm underline-offset-4 hover:underline"
            >
              {t.viewBag}
            </LocaleLink>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
