# Architecture

## Why headless Shopify

Shopify already solves catalogue, inventory, carts, tax, and PCI checkout. Rebuilding those systems for a portfolio shop would be dishonest and expensive. The storefront is a specialised client: it should be better at merchandising and content than the default theme, and otherwise stay out of the way.

## Provider boundary

```
src/lib/commerce/types.ts          shared models
src/lib/commerce/provider.ts       shopify | demo switch
src/lib/commerce/filters.ts        query, sort, facets (used by both modes)
src/lib/commerce/url-state.ts      URL <-> ProductQuery
src/lib/commerce/shopify/          GraphQL client, queries, mapper, provider
src/lib/commerce/demo/             catalogue, cookie cart, provider
src/lib/cart/actions.ts            server actions consumed by the UI
```

UI components import `Product`, `Cart`, and server actions. They do not import `shopifyFetch` or the demo catalogue.

The switch is environment, not a runtime feature flag in the client:

```
SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_PRIVATE_TOKEN  → Shopify (2026-07)
otherwise                                                 → demo
```

The private token is sent as `Shopify-Storefront-Private-Token` from the server only, with `Shopify-Storefront-Buyer-IP` when a buyer IP is available. It is never prefixed `NEXT_PUBLIC_`.

If Shopify is configured and the Storefront API fails, the request errors. The demo catalogue is not used as a silent fallback.

## Data flow

**Reads** happen in Server Components. A collection page parses `searchParams`, asks the provider for `{ collection, products, facets }`, and renders the grid.

**Writes** happen in server actions. `addItemToCart` ensures a cart id (Shopify cart GID or demo id), mutates the cart, and returns the normalised `Cart`. The client provider stores that result so the drawer and header count update without a full reload.

## Demo cart

Serverless hosts do not share memory. Demo cart lines live in an httpOnly cookie (`paw_pine_cart`). The cookie is small: line id, variant id, quantity. Product titles and prices are hydrated from the catalogue on read.

## Shopify cart

The same cookie stores only `{ mode: "shopify", id }`. Line items are fetched from the Storefront API with `cache: "no-store"`. Checkout is `cart.checkoutUrl`.

## Shopify taxonomy fallback

If a collection handle such as `dogs` does not exist in the connected shop, the provider loads **live Storefront products** and applies tag/species filters. Overlay titles are generated from the handle. This is not the demo catalogue. Network, auth, and GraphQL failures still surface as shop errors.

## Caching

Catalogue reads are cacheable. Cart state is not.

- **Product, collection, and search GraphQL** use `fetch` with `revalidate: 60` (search `30`). Reviewers see a fresh-enough catalogue without hammering Shopify.
- Listing queries request `PRODUCT_CARD_FIELDS` only: no description, `descriptionHtml`, gallery images, options, or variants. Product detail adds those fields, including `quantityAvailable` on variants.
- Home uses a single `getProducts()` and filters merchandising collections in process. Product pages start `getProduct` and `getRecommendations` together (recommendations also parallelise detail + listing).
- **Cart queries and mutations** use `cache: "no-store"`. Cart IDs live in an httpOnly cookie; the cookie is not read in the root layout, so product pages are not forced into dynamic rendering just because a bag exists.
- **Demo cart** hydrates from that cookie on demand. It is never stored in the Next.js Data Cache.
- **Search suggestions** (`/api/search/suggest`) are `private, no-store`. Client sends `x-paw-pine-locale` because `/api` is outside the locale middleware. Caching a Finnish payload onto an English page would mix languages.
- **Google Shopping feed** (`/api/feeds/google-shopping.xml`) uses `s-maxage=3600`. Catalogue GraphQL for the feed still uses the provider’s 60s revalidate. Failures return 503 with well-formed XML, `no-store`.
- `/cart` and `/wishlist` and `/demo/analytics` are `noindex`. Wishlist and recently viewed live in `localStorage` on the device, not on the server.
- Root layout still reads commerce **mode** (credentials present or not). That is a deploy-time switch, not shopper-specific cart data.
- **Health** (`/api/health`) and **web vitals** (`/api/vitals`) are `no-store`. See [performance.md](./performance.md).

Do not add `cookies()` to catalogue pages. Do not cache Shopify cart payloads.

## Errors

`CommerceError` carries a stable `code` (`unavailable`, `not_found`, `invalid_cart`, `out_of_stock`, `network`, `rate_limited`). Shopper copy is mapped in `toUserErrorMessage`. GraphQL error bodies, HTTP payloads, and Storefront tokens never reach the browser. Expired Shopify carts (`cart: null` or “does not exist”) clear the cart cookie so the next add creates a new cart.

## Analytics

`track()` is a single function gated on analytics consent. Pages and buttons emit a typed ecommerce event union. Providers can target GTM (`dataLayer`), a console debugger, or sessionStorage. GTM is not loaded before consent. See [analytics.md](./analytics.md).

## Local merchandising (no account, no database)

Wishlist and recently viewed live in `localStorage` on the device (`paw_pine_wishlist`, `paw_pine_recently_viewed`). The server never reads them. Related products are ranked in `getRelatedProducts(current, catalogue)` from species, category, tags, collection membership, and price proximity — not an API or model.

## Shipping and messaging adapters

`ShippingProvider`, `NotificationProvider`, and `NewsletterProvider` are server-side ports. This repo implements mocks only. Shopify checkout still owns real shipping. See [future-architecture.md](./future-architecture.md).
