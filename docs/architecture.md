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
SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_ACCESS_TOKEN  → Shopify
otherwise                                               → demo
```

## Data flow

**Reads** happen in Server Components. A collection page parses `searchParams`, asks the provider for `{ collection, products, facets }`, and renders the grid.

**Writes** happen in server actions. `addItemToCart` ensures a cart id (Shopify cart GID or demo id), mutates the cart, and returns the normalised `Cart`. The client provider stores that result so the drawer and header count update without a full reload.

## Demo cart

Serverless hosts do not share memory. Demo cart lines live in an httpOnly cookie (`paw_pine_cart`). The cookie is small: line id, variant id, quantity. Product titles and prices are hydrated from the catalogue on read.

## Shopify cart

The same cookie stores only `{ mode: "shopify", id }`. Line items are fetched from the Storefront API with `cache: "no-store"`. Checkout is `cart.checkoutUrl`.

## Shopify taxonomy fallback

If a collection handle such as `dogs` does not exist in the connected shop, the provider loads products and applies the same tag/species filters as demo mode. That lets a store go live before every collection is merchandised, as long as products are tagged.

## Caching

- Product and collection GraphQL reads use `revalidate: 60`.
- Cart queries and mutations do not cache.
- Root layout does not call `cookies()`, so product pages are not opted into dynamic rendering solely because of the bag.

## Errors

`CommerceError` carries a stable `code`. User-facing copy is mapped in `toUserErrorMessage`. GraphQL error bodies and tokens are never sent to the client.

## Analytics

`track()` is a single function. Pages and buttons emit ecommerce events. GTM is optional. Replacing the sink does not require touching product components.
