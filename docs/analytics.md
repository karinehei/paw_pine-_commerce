# Analytics event layer

The storefront emits vendor-neutral ecommerce events from the UI. Nothing in product or cart components imports GA4, GTM, or Plausible. `track()` fans each event out to `AnalyticsProvider` implementations.

No paid analytics platform is required for the portfolio demo.

## Why this shape

Shopify checkout is hosted. The storefront can measure discovery and cart intent reliably. `purchase` is only complete when an order confirmation exists (Shopify order status page, a thank-you route, or a webhook). Demo mode never pretends a payment happened. Clicking Checkout emits `begin_checkout` only.

## Consent

| Category          | Default                   | Purpose                                                                       |
| ----------------- | ------------------------- | ----------------------------------------------------------------------------- |
| Necessary cookies | Always on                 | Language (`paw_pine_locale`), bag, consent choice itself                      |
| Analytics cookies | Off until explicit accept | `dataLayer` pushes, optional GTM snippet, session funnel on `/demo/analytics` |

The banner offers **Accept analytics**, **Necessary only**, and **Manage preferences**. The footer repeats **Cookie preferences**. The choice is stored in the first-party cookie `paw_pine_consent` for 180 days. GTM is not injected, and `track()` is a no-op, until analytics is accepted.

## Events

| Event               | When it fires                                    | Meaningful fields                                                       |
| ------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| `page_view`         | App Router navigation, after consent             | `page_path`, `page_title`                                               |
| `view_item_list`    | Collection, search, and home merchandising grids | `item_list_id`, `item_list_name`, `items[]`                             |
| `select_item`       | Product card click                               | list context plus the selected item                                     |
| `view_item`         | Product detail                                   | `currency`, `value`, `items[]`                                          |
| `search`            | Search results with a query                      | `search_term`, `results_count`                                          |
| `add_to_cart`       | Successful add                                   | `currency`, `value`, line `items[]`                                     |
| `remove_from_cart`  | Line removed                                     | `items[]`                                                               |
| `view_cart`         | Cart drawer or `/cart`                           | `currency`, `value`, `items[]`                                          |
| `begin_checkout`    | Checkout CTA                                     | `currency`, `value`, `items[]`                                          |
| `purchase`          | Order confirmation only — not implemented here   | `transaction_id`, `currency`, `value`, `items[]`, optional `demo: true` |
| `newsletter_signup` | Newsletter form success                          | none                                                                    |

Item payloads use product handle as `id` / `handle` (stable across demo and Shopify GIDs), plus name, brand, category, species, variant, price, quantity, and currency when they exist. The dataLayer adapter maps those fields to GA4 `item_*` names.

Events are a TypeScript discriminated union (`EcommerceEvent` in `src/lib/analytics/types.ts`). Invalid combinations do not compile. Identical events within 250ms are dropped so React Strict Mode rerenders do not double-count.

## Providers

| Provider                       | Role                                                                    |
| ------------------------------ | ----------------------------------------------------------------------- |
| `DataLayerAnalyticsProvider`   | Pushes `{ event, ecommerce }` so GTM / GA4 can be wired later           |
| `DevelopmentAnalyticsProvider` | Console logs in development, or when `NEXT_PUBLIC_ANALYTICS_DEBUG=true` |
| Session provider               | Stores the last 200 events in `sessionStorage` for `/demo/analytics`    |

Register another destination by implementing `AnalyticsProvider` and adding it in `getRuntime()`. No analytics account is required to run the shop.

## GTM / GA4

Set `NEXT_PUBLIC_GTM_ID` to a `GTM-…` container if you want the snippet injected **after** analytics consent. The app runs without it. Map the event names in GTM; product components do not change.

## Demo funnel page

`/demo/analytics` is `noindex` and labelled **DEMO DATA**. The large numbers are an **illustrative demo dataset**. The lower section reads this browser’s sessionStorage only, and only after consent. Neither is production traffic.

## Hosted-checkout purchase tracking

`purchase` stays in the event model. Production options, none of which are required for this €0 portfolio:

- Shopify order status / thank-you additional script that pushes `purchase` with the order id
- A Shopify webhook to a serverless route that records the conversion server-side
- GA4 Measurement Protocol from that webhook

Do not fire `purchase` from the Checkout button.
