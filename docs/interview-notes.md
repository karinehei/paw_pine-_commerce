# Interview notes

Short answers for a Web Developer conversation. Architecture: `docs/architecture.md`, `docs/case-study.md`, `docs/free-tier-architecture.md`.

## 1. Why Shopify?

It already owns catalogue, inventory, carts, tax, and PCI checkout. For a small merchant that is the correct system of record. The storefront should be a client of that system, not a second commerce backend.

## 2. Why headless?

To control merchandising UX, URLs, performance, SEO, and measurement independently of Liquid. It is also the right shape for a portfolio: it shows API integration and frontend architecture, not theme tweaking. It is not the default recommendation for every new shop — see question 20 and the case study.

## 3. Why Next.js?

App Router and React Server Components fit a catalogue that should be cacheable, crawlable, and cheap to render. Metadata, sitemap, and image handling are first-class. Vercel Hobby (or any Node host) is a straightforward deploy without a paid frontend SaaS.

## 4. Why not WooCommerce?

WooCommerce would mean owning WordPress, PHP plugins, hosting, and often a more fragile checkout and plugin surface. Shopify’s hosted checkout and Storefront API match a small Nordic merchant that should not run a CMS as a payment stack. WooCommerce can still be right if the business is already on WordPress and has that ops skill.

## 5. Why not build the commerce backend yourself?

Orders, tax, inventory, fraud, and PCI are not a portfolio differentiator. Building them would spend time on the wrong risk. Shopify (or another platform) should own those primitives; this repo owns presentation, discovery, SEO, and measurement architecture.

## 6. Why keep checkout in Shopify?

PCI, payment methods, Shop Pay, and address/shipping configuration already exist there. Rebuilding checkout is a large compliance and UX project. The storefront validates `checkoutUrl` (HTTPS, Shopify host) and then leaves. Demo mode never collects payment.

## 7. How does cart state work?

A short httpOnly cookie stores either a Shopify cart GID or a demo cart id plus line ids. The root layout does not read it, so catalogue pages stay cacheable. A client `CartProvider` hydrates via `GET /api/cart` after load. Mutations use `POST /api/cart` (not App Router server actions) so locale middleware cannot rewrite the request. The response is a normalised `Cart` so the drawer updates without a full navigation. Shopify cart GraphQL is `no-store`.

## 8. How is SEO implemented?

Metadata API (titles, descriptions, canonicals, OG/Twitter), locale-prefixed URLs with hreflang, `sitemap.ts`, `robots.ts`, semantic headings, crawlable nav, image alt, and JSON-LD for Organization, WebSite, Product, and BreadcrumbList. No fake aggregate ratings. `/api/feeds/google-shopping.xml` is a no-cost product feed for review; it is not submitted to Merchant Center.

## 9. How is conversion measured?

Funnel events: `view_item_list` → `select_item` → `view_item` → `add_to_cart` → `view_cart` → `begin_checkout`. Storefront can measure through checkout start reliably. `purchase` is in the type system and is not fired from the Checkout button. `/demo/analytics` shows the maths with labelled **DEMO DATA**. Analytics cookies stay off until consent.

## 10. What is real versus mocked?

**Real:** Next.js storefront, Shopify Storefront GraphQL (when credentials are set), Shopify cart and hosted checkout, demo catalogue fallback, SEO, typed analytics + consent, wishlist/recently viewed on device, Merchant XML generation, FI/EN/SV UI, tests, CI.

**Mock integrations:** Finnish delivery rates, newsletter send, restock email, contact delivery.

**Architecture-only:** `purchase` event, GTM/GA4 until a container is configured, Merchant Center upload, Posti/Matkahuolto adapters (interfaces exist; live classes are not in this repo).

## 11. Why is Posti mocked?

A production Posti integration needs a merchant contract, credentials, and usually a Shopify carrier service or checkout extension. Buying that solely for a portfolio would violate the €0 constraint and would still not prove more than a typed `ShippingProvider`. The mock returns labelled demo FI locker / service-point / home rates after a `^[0-9]{5}$` postcode check. Copy says demo rates; checkout still confirms shipping on Shopify.

## 12. How would a real Posti integration be added?

Implement `PostiShippingProvider` against `ShippingProvider` (`getRates`, `createShipment`, `getTracking`) with server-only `POSTI_*` credentials. Wire `getShippingProvider()` to it in production. Prefer a Shopify carrier service so **final** rates stay in Checkout. Never call Posti from the browser. Same pattern for Matkahuolto. See `docs/future-architecture.md`.

## 13. How would GTM/GA4 be deployed?

Set `NEXT_PUBLIC_GTM_ID` to a `GTM-…` container. After the shopper accepts analytics cookies, events push a GA4-shaped `dataLayer` payload and the snippet loads. Map those event names in GTM. No product-component changes. The shop runs with the ID empty — that is the portfolio default. This is **not** a live production GA4 property today.

## 14. How would real purchase tracking work?

Do not fire `purchase` from the Checkout button. Options: Shopify order status / thank-you additional script with the order id; a webhook to a serverless route; GA4 Measurement Protocol from that webhook. Demo mode must never invent a transaction id.

## 15. How would Google Merchant Center be connected?

Point Merchant Center at `/api/feeds/google-shopping.xml` (scheduled fetch) or push via Content API. The feed is already Merchant-shaped and works without a Google ads campaign. Connecting it requires a Google Merchant account. This repository does **not** submit the feed.

## 16. How is GDPR handled?

Necessary cookies (language, bag, consent cookie) are always on. Analytics stay off until **Accept analytics**. **Necessary only** and **Cookie preferences** (`/cookies` plus the footer control) persist `paw_pine_consent` for 180 days. GTM is not injected, and `track()` is a no-op, until analytics is accepted. Wishlist stays on-device.

## 17. How does multilingual SEO work?

Finnish is the default market (`/` → `/fi`). English `/en`, Swedish `/sv`. Each indexable URL has a canonical and hreflang set (`localizedAlternates`). UI copy lives in `locales/{fi,en,sv}.json` with a lockstep-key test. Shopify product copy is whatever Storefront `@inContext` returns; this repo does not invent live-catalogue translations.

## 18. How would the system handle 10x traffic?

Keep catalogue fetches ISR; do not cache carts. Put the storefront behind a CDN (Vercel already does). Cap search query length (already done). Add collection pagination (not built; queries cap at 50). If Shopify 429s, surface `rate_limited` and back off. Horizontal scale is mostly the host; the bottleneck is Storefront API cost and checkout, which Shopify owns.

## 19. What would need to change for production?

Paid Shopify plan and a live shop; real photography; connect GTM/GA4 if measurement is required; `purchase` from order confirmation; pagination; CSP allowlist if GTM is used; rate limits on public POSTs; replace mock shipping/email when volume justifies contracts; Merchant Center if ads/organic listings need it; consider Online Store theme instead of headless if the team is small (see below).

## 20. What would you prioritize during the first 90 days of a real ecommerce launch?

1. **Sell with the smallest honest stack** — often a Shopify theme, not headless, unless the brief already requires custom discovery.
2. **Catalogue quality** — photography, titles, tags, inventory, shipping in Checkout.
3. **Checkout and trust** — policies, returns, payment methods that Finnish shoppers actually use.
4. **Measurement** — consent + GTM/GA4 + `purchase` from Shopify, not from the bag button.
5. **Only then** custom storefront work (filters, content, performance) if the theme is the constraint.

If this headless storefront were the launch vehicle: connect the paid shop, replace demo shipping copy with Checkout rates, wire purchase tracking, paginate collections, and keep mocks until carrier/ESP contracts exist.
