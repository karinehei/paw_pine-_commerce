import { CartLineItem } from "@/components/cart/CartLineItem";
import { CheckoutCta } from "@/components/cart/CheckoutCta";
import { DeliveryEstimate } from "@/components/commerce/DeliveryEstimate";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnalyticsListener } from "@/components/analytics/AnalyticsListener";
import { getCart } from "@/lib/cart/actions";
import { getCommerceMode } from "@/lib/env";
import { resolveCheckoutHref } from "@/lib/commerce/checkout";
import { ESTIMATED_SHIPPING_AMOUNT, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { formatMoney, moneyFromNumber, parseAmount } from "@/lib/format";
import { itemsFromCart } from "@/lib/analytics/items";
import { firstSearchParam, type QueryPageProps } from "@/lib/page-props";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";
import { localizedAlternates } from "@/lib/i18n/path";
import { numberLocale } from "@/lib/i18n/config";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getMessages(locale);
  return {
    title: t.bag,
    description: t.bagMeta,
    robots: { index: false, follow: false },
    alternates: localizedAlternates("/cart", locale),
  };
}

export default async function CartPage({ searchParams }: QueryPageProps) {
  const t = getMessages(await getLocale());
  const locale = numberLocale(await getLocale());
  const cart = await getCart();
  const mode = getCommerceMode();
  const params = await searchParams;
  const checkoutDemo = firstSearchParam(params.checkout) === "demo";
  const lines = cart?.lines ?? [];
  const subtotal = cart ? parseAmount(cart.cost.subtotalAmount) : 0;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const checkout = resolveCheckoutHref(mode, cart?.checkoutUrl);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-display text-4xl">{t.bag}</h1>
      {checkoutDemo && mode === "demo" ? (
        <p className="border-border bg-paper mt-6 border px-4 py-3 text-sm" role="status">
          {t.checkoutDemo}
        </p>
      ) : null}
      {lines.length === 0 || !cart ? (
        <EmptyState
          title={t.emptyBagTitle}
          description={t.emptyBagPage}
          action={{ href: "/collections/all", label: t.continueBrowsing }}
        />
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
          <ul className="space-y-6">
            {lines.map((line) => (
              <CartLineItem key={line.id} line={line} />
            ))}
          </ul>
          <aside className="border-border bg-paper h-fit space-y-4 border p-6">
            <div className="flex justify-between text-sm">
              <span>{t.subtotal}</span>
              <span>{formatMoney(cart.cost.subtotalAmount, locale)}</span>
            </div>
            <p className="text-muted text-sm">
              {remaining > 0
                ? t.shippingFrom(formatMoney(moneyFromNumber(remaining), locale))
                : t.shippingComplimentary}
            </p>
            <p className="text-muted text-xs">
              {t.shippingEstimatePage(
                formatMoney(
                  moneyFromNumber(remaining > 0 ? ESTIMATED_SHIPPING_AMOUNT : 0),
                  locale,
                ),
              )}
            </p>
            <DeliveryEstimate />
            <CheckoutCta cart={cart} href={checkout.href} external={checkout.external} />
          </aside>
          <AnalyticsListener
            event={{
              name: "view_cart",
              currency: cart.cost.subtotalAmount.currencyCode,
              value: subtotal,
              items: itemsFromCart(cart),
            }}
          />
        </div>
      )}
      <RecentlyViewed />
    </div>
  );
}
