"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { track } from "@/lib/analytics/events";
import {
  ESTIMATED_SHIPPING_AMOUNT,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/constants";
import { formatMoney, moneyFromNumber, parseAmount } from "@/lib/format";

export function CartDrawer() {
  const { cart, isOpen, closeCart, mode } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (isOpen && !dialog.open) {
      dialog.showModal();
    }
    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    closeCart();
  }, [pathname, closeCart]);

  const subtotal = cart ? parseAmount(cart.cost.subtotalAmount) : 0;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const checkoutHref =
    mode === "shopify" && cart?.checkoutUrl.startsWith("http")
      ? cart.checkoutUrl
      : "/cart?checkout=demo";

  return (
    <dialog
      ref={dialogRef}
      onClose={closeCart}
      aria-labelledby="cart-drawer-title"
      className="fixed inset-y-0 right-0 m-0 ml-auto h-full max-h-none w-full max-w-md border-0 bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/40"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="cart-drawer-title" className="font-display text-2xl">
            Bag
          </h2>
          <button type="button" onClick={closeCart} className="text-sm text-muted">
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {!cart || cart.lines.length === 0 ? (
            <EmptyState
              title="Your bag is empty"
              description="Objects for dogs and cats, chosen with the rest of the house in mind."
              action={{ href: "/collections/all", label: "Continue browsing" }}
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
          <div className="space-y-3 border-t border-border px-5 py-5">
            <p className="text-sm text-muted">
              {remaining > 0
                ? `${formatMoney(moneyFromNumber(remaining, cart.cost.subtotalAmount.currencyCode))} away from complimentary shipping.`
                : "Complimentary shipping on this order."}
            </p>
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatMoney(cart.cost.subtotalAmount)}</span>
            </div>
            <p className="text-xs text-muted">
              Shipping calculated at checkout. Estimate{" "}
              {formatMoney(
                moneyFromNumber(
                  remaining > 0 ? ESTIMATED_SHIPPING_AMOUNT : 0,
                  cart.cost.subtotalAmount.currencyCode,
                ),
              )}{" "}
              before the complimentary threshold.
            </p>
            {checkoutHref.startsWith("http") ? (
              <a
                href={checkoutHref}
                onClick={() => track({ name: "begin_checkout" })}
                className="block bg-pine px-4 py-3 text-center text-sm tracking-[0.14em] text-paper uppercase hover:bg-pine-hover"
              >
                Checkout
              </a>
            ) : (
              <Link
                href={checkoutHref}
                onClick={() => {
                  track({ name: "begin_checkout" });
                  closeCart();
                }}
                className="block bg-pine px-4 py-3 text-center text-sm tracking-[0.14em] text-paper uppercase hover:bg-pine-hover"
              >
                Checkout
              </Link>
            )}
            <Link
              href="/cart"
              onClick={closeCart}
              className="block text-center text-sm text-muted underline-offset-4 hover:underline"
            >
              View bag
            </Link>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
