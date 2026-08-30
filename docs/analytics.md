# Analytics event layer

The storefront emits vendor-neutral ecommerce events from the UI. Nothing in product or cart components imports GA4, GTM, or Plausible. `track()` fans each event out to adapters.

## Why this shape

Shopify checkout is hosted. The storefront can measure discovery and cart intent reliably. `purchase` is only complete when an order confirmation exists (Shopify order status / webhook). Demo mode never pretends a payment happened.

## Events

| Event               | When it fires                                    | Meaningful fields                                                       |
| ------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| `page_view`         | App Router navigation                            | `page_path`, `page_title`                                               |
| `view_item_list`    | Collection, search, and home merchandising grids | `item_list_id`, `item_list_name`, `items[]`                             |
| `select_item`       | Product card click                               | list context plus the selected item                                     |
| `view_item`         | Product detail                                   | `currency`, `value`, `items[]`                                          |
| `search`            | Search results with a query                      | `search_term`, `results_count`                                          |
| `add_to_cart`       | Successful add                                   | `currency`, `value`, line `items[]`                                     |
| `remove_from_cart`  | Line removed                                     | `items[]`                                                               |
| `view_cart`         | Cart drawer or `/cart`                           | `currency`, `value`, `items[]`                                          |
| `begin_checkout`    | Checkout CTA                                     | `currency`, `value`, `items[]`                                          |
| `purchase`          | Order confirmation only                          | `transaction_id`, `currency`, `value`, `items[]`, optional `demo: true` |
| `newsletter_signup` | Newsletter form success                          | none                                                                    |

Item payloads use product handle as `item_id` (stable across demo and Shopify GIDs), plus name, brand, category, variant, price, and quantity when they exist.

Events are a TypeScript discriminated union (`src/lib/analytics/types.ts`). Invalid combinations do not compile.

## Adapters

| Adapter     | Role                                                                 |
| ----------- | -------------------------------------------------------------------- |
| `dataLayer` | Pushes `{ event, ecommerce }` so GTM / GA4 can be wired later        |
| `session`   | Stores the last 200 events in `sessionStorage` for `/demo/analytics` |
| `console`   | Logs in development, or when `NEXT_PUBLIC_ANALYTICS_DEBUG=true`      |

Add a Plausible or first-party adapter by implementing `AnalyticsAdapter` and registering it in `getAdapters()`. No analytics account is required to run the shop.

## Demo funnel page

`/demo/analytics` is `noindex`. The large numbers are an **illustrative demo dataset**, labelled as such. The lower section reads this browser’s sessionStorage only. Neither is production traffic.

## What still needs a live shop

- Real `purchase` after Shopify-hosted checkout
- Server-side conversion matching (optional)
- A GTM container ID (`NEXT_PUBLIC_GTM_ID`) if you want the snippet injected
