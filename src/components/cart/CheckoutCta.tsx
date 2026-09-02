"use client";

import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useLocale, useMessages } from "@/components/i18n/LocaleProvider";
import { track } from "@/lib/analytics/events";
import { itemsFromCart } from "@/lib/analytics/items";
import { parseAmount } from "@/lib/format";
import { withLocale } from "@/lib/i18n/path";
import type { Cart } from "@/lib/commerce/types";

export function CheckoutCta({
  cart,
  href,
  hardNavigation,
}: {
  cart: Cart;
  href: string;
  hardNavigation: boolean;
}) {
  const t = useMessages();
  const locale = useLocale();
  function onClick() {
    track({
      name: "begin_checkout",
      currency: cart.cost.subtotalAmount.currencyCode,
      value: parseAmount(cart.cost.subtotalAmount),
      items: itemsFromCart(cart),
    });
  }

  const className = "btn-primary w-full";

  if (hardNavigation) {
    return (
      <a href={withLocale(href, locale)} onClick={onClick} className={className}>
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
