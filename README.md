# Paw & Pine

A headless Shopify storefront for a curated Scandinavian pet accessories house. The project is a portfolio piece: it shows how to build a production-shaped ecommerce client on top of Shopify, without reinventing catalogue, cart, checkout, or payments.

The store runs without Shopify credentials. When the Storefront API is not configured, a realistic demo catalogue and cookie cart take over. The UI never knows which source it is talking to.

## 1. Project overview

Paw & Pine is a premium shop for dogs and cats. The storefront is a Next.js App Router application. Shopify remains the system of record for products, inventory, carts, and checkout. This repository owns presentation, merchandising UX, SEO, analytics events, and performance.

It is designed to be deployed on Vercel, reviewed as a GitHub repository, and run locally by anyone who clones it.

## 2. Business problem

Most pet retail looks loud because the product is treated as a toy aisle. Paw & Pine is the opposite brief: objects that can live in a considered room — oak, wool, stoneware, sisal — sold with the restraint of a small Nordic house.

The engineering problem underneath that brief is common:

- Merchants already have Shopify for catalogue and checkout.
- They still need a custom storefront for brand, search, filtering, and content.
- The storefront must be reviewable and developable before credentials exist.

## 3. Architecture

```
Customer
  → Next.js storefront (App Router, RSC)
    → CommerceProvider
      → Shopify Storefront GraphQL API   (when credentials exist)
      → Demo catalogue + cookie cart     (when they do not)
        → Shopify-hosted checkout        (Shopify mode only)
```

The storefront owns UI, URL-driven collection state, SEO, and analytics. Shopify owns products, variants, prices, inventory, carts, orders, and payments. There is no custom order backend.

`getCommerceProvider()` is the only switch. Pages call the provider. They do not import Shopify or the demo module.

Root layout does not read the cart cookie, so catalogue pages can stay cacheable. The cart hydrates in a client provider after load and updates from server actions.

## 4. Technology stack

- Next.js 16, App Router, React Server Components
- TypeScript in strict mode
- Tailwind CSS v4
- Shopify Storefront GraphQL API (fetch, no extra SDK)
- Shopify-hosted checkout
- Cookie cart in demo mode
- Vitest for unit tests
- Playwright for end-to-end tests
- GitHub Actions for CI
- Vercel as the intended host

Dependencies are kept short. Shopify is called with `fetch`. There is no fake REST backend pretending to be Shopify.

## 5. Shopify integration

Server-only module: `src/lib/commerce/shopify/`.

The client posts GraphQL to `https://{store}/api/{version}/graphql.json` with `X-Shopify-Storefront-Access-Token`. The token never ships to the browser. `server-only` guards the client and env helpers.

Implemented operations:

- Product listing and product by handle
- Collections, with a tag-based fallback when a handle does not exist in Shopify
- Search
- Cart create / add / update / remove
- Checkout URL from the Storefront cart

Sorting uses Shopify sort keys, then the same in-memory filters as demo mode so price, material, and availability stay consistent.

Expected Shopify tags (so the storefront taxonomy still works on live data):

- `species:dog` or `species:cat`
- `category:toys|harnesses|beds|feeding|scratching`
- `material:Oak`
- `new`, `bestseller`
- optional `feature:...` lines

`vendor` maps to brand. `productType` is a fallback for category.

## 6. Demo mode

If `SHOPIFY_STORE_DOMAIN` or `SHOPIFY_STOREFRONT_ACCESS_TOKEN` is missing, the app uses `src/lib/commerce/demo/`.

Demo mode includes:

- 16 original products across dogs and cats
- Collections for species, category, new arrivals, and best sellers
- Variant stock, including an out-of-stock Trail Harness XL
- A cart persisted in an httpOnly cookie
- Checkout CTA that explains Shopify is required for payment

The footer states whether the catalogue is demo or live. That is deliberate: reviewers should not mistake mock data for a connected shop.

## 7. Ecommerce UX decisions

The visual language is a quiet Scandinavian shop, not a developer kit: linen ground, pine CTAs, serif display type, still-life product fields instead of stock photography.

Other choices:

- Product cards do not add to cart. Too many pieces have sizes; the product page is the purchase surface.
- Filters live in the URL so collections are shareable and refresh-safe.
- Complimentary shipping is messaged against a €75 threshold, with an estimate below it.
- Demo checkout is not a fake payment form. It tells the truth.
- Motion is limited. `prefers-reduced-motion` is respected.

## 8. SEO implementation

- Metadata templates and canonical URLs
- Open Graph image generated in-app
- JSON-LD for Organization, Product, and BreadcrumbList
- `sitemap.ts` from products and collections
- `robots.ts` allowing the catalogue and excluding `/cart`
- Semantic headings and crawlable collection links

## 9. Analytics architecture

Events are pushed to `window.dataLayer` in a shape compatible with GTM / GA4 ecommerce. If `NEXT_PUBLIC_GTM_ID` is set, the GTM snippet is injected.

Tracked events:

- `view_item`
- `view_item_list`
- `add_to_cart`
- `remove_from_cart`
- `begin_checkout`
- `search`
- `newsletter_signup`

In development the same payload is logged. No analytics vendor is hard-wired. Swap the `track()` sink if you prefer a first-party collector.

## 10. Testing

Unit tests (Vitest) cover filtering, URL state, demo cart maths, money formatting, and the Shopify product mapper.

Playwright covers the paths a reviewer will click: home, collection URL filters, add to bag, search query strings, about, and empty search.

CI runs lint, typecheck, unit tests, production build, and Playwright.

## 11. Performance

- Server Components for catalogue pages
- Layout avoids cart cookies so pages are not forced dynamic
- Next/Image for Shopify CDN assets
- Local still-life SVGs for demo media (no third-party image host)
- Collection and product `loading.tsx` skeletons
- Fetch caching on Shopify reads (`revalidate: 60`); cart mutations are `no-store`

## 12. Accessibility

- Skip link, visible focus, semantic landmarks
- Form labels on search, filters, newsletter, and contact
- `dialog` for cart and mobile menu
- Alt text from product titles; still-life SVGs expose `aria-label`
- Reduced-motion cutoff in CSS
- Contrast aimed at WCAG 2.2 AA on linen / ink / pine

## 13. Local setup

Requires Node 20+ (22 is used in CI). From the project root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No Shopify account is required.

Useful scripts:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm start
```

## 14. Environment variables

Copy `.env.example` to `.env.local`. Only these values are used:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | For canonical URLs in production | Site origin |
| `NEXT_PUBLIC_GTM_ID` | No | Optional GTM container |
| `SHOPIFY_STORE_DOMAIN` | For live catalogue | `your-store.myshopify.com` |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | For live catalogue | Storefront API token |
| `SHOPIFY_STOREFRONT_API_VERSION` | No | Defaults to `2025-04` |

Never commit `.env.local`. Tokens stay on the server.

## 15. Deployment

The app is a standard Next.js project.

1. Push to GitHub.
2. Import the repo in Vercel.
3. Set `NEXT_PUBLIC_SITE_URL` to the production origin.
4. Optionally set Shopify and GTM variables.
5. Deploy.

Without Shopify env vars, production still serves the demo catalogue. That is useful for portfolio hosting.

## 16. Screenshots

Add captures here after first run (desktop and mobile):

- Home hero and category row
- Collection with filters applied
- Product detail with variant selection
- Cart drawer
- Search results

`docs/screenshots/` is the intended folder.

## 17. Future improvements

- Predictive search and collection pagination
- Customer accounts via Shopify Customer Account API
- Klaviyo or Shopify Email for the newsletter
- Localization / multi-currency
- Fine-grained Shopify metafields instead of tags
- Visual regression tests
- Signed Shopify webhooks if the storefront later needs order status

## License

Private portfolio project. Product names and still-life artwork are original to this repository; do not use copyrighted brand assets when you connect a live shop.
