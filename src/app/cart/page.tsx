import { CartLineItem } from "@/components/cart/CartLineItem";
import { CheckoutCta } from "@/components/cart/CheckoutCta";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnalyticsListener } from "@/components/analytics/AnalyticsListener";
import { getCart } from "@/lib/cart/actions";
import { getCommerceMode } from "@/lib/env";
import { resolveCheckoutHref } from "@/lib/commerce/checkout";
import {
  ESTIMATED_SHIPPING_AMOUNT,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/constants";
import { formatMoney, moneyFromNumber, parseAmount } from "@/lib/format";
import { itemsFromCart } from "@/lib/analytics/items";
import { firstSearchParam, type QueryPageProps } from "@/lib/page-props";

export const metadata = {
  title: "Bag",
  description: "Review your Paw & Pine bag before checkout.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/cart" },
};

export default async function CartPage({ searchParams }: QueryPageProps) {
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
      <h1 className="font-display text-4xl">Bag</h1>
      {checkoutDemo && mode === "demo" ? (
        <p className="mt-6 border border-border bg-paper px-4 py-3 text-sm" role="status">
          This is the checkout boundary. Payments are taken on Shopify-hosted checkout when a store
          is connected. No payment is collected in demo mode.
        </p>
      ) : null}
      {lines.length === 0 || !cart ? (
        <EmptyState
          title="Your bag is empty"
          description="Start with dogs, cats, or the full edit."
          action={{ href: "/collections/all", label: "Continue browsing" }}
        />
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
          <ul className="space-y-6">
            {lines.map((line) => (
              <CartLineItem key={line.id} line={line} />
            ))}
          </ul>
          <aside className="h-fit space-y-4 border border-border bg-paper p-6">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatMoney(cart.cost.subtotalAmount)}</span>
            </div>
            <p className="text-sm text-muted">
              {remaining > 0
                ? `${formatMoney(moneyFromNumber(remaining))} from complimentary shipping.`
                : "Complimentary shipping on this order."}
            </p>
            <p className="text-xs text-muted">
              Estimated shipping{" "}
              {formatMoney(moneyFromNumber(remaining > 0 ? ESTIMATED_SHIPPING_AMOUNT : 0))} until the
              threshold is met. Duties are not included.
            </p>
            <CheckoutCta
              cart={cart}
              href={checkout.href}
              external={checkout.external}
            />
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
    </div>
  );
}
