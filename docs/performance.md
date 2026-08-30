# Performance and operations

This storefront is built to run on **free** hosting (Vercel Hobby) and **free** Storefront API usage. There is no paid APM, RUM, CDN, or image platform. Do not claim Lighthouse or CrUX scores unless they were measured on a deployed URL.

## Core Web Vitals strategy

Optimise the HTML the server already sends. Catalogue pages are Server Components. Client JS is limited to cart, consent, filters, purchase, and a few merchandising islands.

| Vital   | Likely risks                                                         | Mitigations in this repo                                                                                                                                                              | What to measure after deploy                                                           |
| ------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **LCP** | Hero / first-row product images; Fraunces heading swap; Shopify TTFB | `next/image` with `priority` on the home hero and the first row of collection grids; AVIF/WebP; slim listing GraphQL; one catalogue fetch on home; parallel product + related fetches | LCP element (image vs heading) on `/`, `/collections/dogs`, `/products/{handle}` on 4G |
| **CLS** | Cookie banner after hydrate; font swap; gallery aspect boxes         | `next/font` with `display: swap` and size-adjusted fallbacks; `aspect-[4/5]` on media                                                                                                 | Banner vs first paint on a first visit; collection grid with remote images             |
| **INP** | Filter panel, cart drawer, variant clicks, GTM after consent         | GTM loads only after analytics consent; Footer is a Server Component; cart is not read in the root layout                                                                             | Time to open bag, change a variant, apply a filter, tap a product card                 |

The production client posts **LCP, INP, CLS, FCP, TTFB** to `POST /api/vitals` (pathname, name, value, rating only). Vercel request logs are the store. This is not a CrUX panel and is not a Lighthouse substitute.

## GraphQL efficiency

Listing queries (`products`, collection products, search) use `PRODUCT_CARD_FIELDS`: handle, title, tags, type, vendor, availability, price range, featured image. They do **not** request description, `descriptionHtml`, options, variants, or gallery images.

Product detail (`productByHandle`) adds description, HTML, up to 8 images, options, and variants including `quantityAvailable`.

All catalogue queries cap at **50 products**. That is enough for this house; it is not a full-catalogue dump. Related products rank in process from that listing plus the detail payload — there is no Shopify recommendations API and no extra species listing after the product fetch.

Home uses **one** `getProducts()` and filters best-sellers / new-arrivals in process (tags `bestseller` and `new`). Collection pages still query Shopify collections when those handles exist.

Cart GraphQL stays `cache: "no-store"` and is not used on catalogue pages.

## Caching

| Data                                 | Cache               |
| ------------------------------------ | ------------------- |
| Product, collection, listing GraphQL | `revalidate: 60`    |
| Search GraphQL                       | `revalidate: 30`    |
| Cart queries and mutations           | `no-store`          |
| `/api/health`, `/api/vitals`         | `no-store`          |
| Search suggestions                   | `private, no-store` |
| Google Shopping feed                 | `s-maxage=3600`     |

Do not call `cookies()` on catalogue pages. Do not put the cart cookie in the root layout. Do not cache cart payloads in the Next Data Cache.

## Health monitoring

`GET /api/health` returns:

```json
{ "status": "ok", "dependencies": { "shopify": "ok" } }
```

`shopify` is `ok`, `error`, or `not_configured` (demo). HTTP 200 when `status` is `ok`, 503 when `degraded`. A configured shop is probed with `query { shop { id } }` and a 2.5s timeout. The response never includes the shop id, tokens, env, or stack traces.

`/api/` stays disallowed in robots. Uptime pings do not need to be indexed. Point a **free** uptime check (UptimeRobot, Better Stack’s free tier, or Vercel’s own request logs) at `https://<host>/api/health`.

## Logging

Vercel captures `console.error` / `console.info` on serverless invocations. Storefront failures log `[storefront] operation code http_status` plus a small JSON object (`event`, `operation`, `code`, `http_status`). Health logs `[health] {"status","shopify"}`. Web vitals log `[cwv] {"name","value","rating","path"}`.

Never logged: Storefront private token, Admin API token, client secrets, GraphQL bodies, emails, cart IDs, buyer IPs, shop GIDs.

## Failure handling

`CommerceError` maps to shopper copy. Shopify configured + API down → error page, not the demo catalogue. Expired carts clear the cookie. Health 503 is for monitors, not for shoppers.

## Vercel

- Framework Preset **Next.js**. Leave Output Directory empty.
- Set `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` for Production (build and runtime). Hobby is enough.
- Image optimisation uses the included `/_next/image` pipeline (`cdn.shopify.com`, AVIF/WebP).
- Hobby function duration is short; the health probe times out at 2.5s so a hung Shopify call cannot burn the whole invocation.
- Streaming RSC + `fetch` cache is the CDN layer. There is no extra paid cache.

## Paid services required

**None.** Optional later (not installed): Vercel Speed Insights, Sentry, Checkly, paid CrUX / Search Console integrations, a hosted RUM agent. Any of those can subscribe to the same `/api/health` and `/api/vitals` shapes without changing shopper UI.
