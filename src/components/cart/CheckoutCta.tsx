"use client";

import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useMessages } from "@/components/i18n/LocaleProvider";
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
  const t = useMessages();
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
        {t.checkout}
      </a>
    );
  }

  return (
    <LocaleLink href={href} onClick={onClick} className={className}>
      {t.checkout}
    </LocaleLink>
  );
}
