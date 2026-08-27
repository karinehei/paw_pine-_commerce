# Interview notes

Short answers for a Web Developer conversation. Longer architecture notes live in `docs/architecture.md` and `docs/case-study.md`.

## 1. Why did you choose Shopify?

It already owns catalogue, inventory, carts, tax, and PCI checkout. For a small merchant that is the correct system of record. The storefront should be a client of that system, not a second commerce backend.

## 2. Why headless?

To control merchandising UX, URLs, performance, SEO, and measurement independently of Liquid. It is also the right shape for a portfolio: it shows API integration and frontend architecture, not theme tweaking.

## 3. Why might standard Shopify be better for a real startup?

Lower complexity, faster launch, fewer systems to maintain. A new shop should usually start with Online Store 2.0 and move to headless only when the theme is the constraint.

## 4. Why Next.js?

App Router and React Server Components fit a catalogue that should be cacheable, crawlable, and cheap to render. Metadata, sitemap, and image handling are first-class. Vercel (or any Node host) is a straightforward deploy.

## 5. How does cart state work?

A short httpOnly cookie stores either a Shopify cart GID or a demo cart id plus line ids. The root layout does not read it. A client `CartProvider` hydrates via a server action after load. Mutations return a normalised `Cart` so the drawer updates without a full navigation.

## 6. How does Shopify checkout work?

`cart.checkoutUrl` from the Storefront API. The storefront validates that the URL is HTTPS and on a Shopify host, then the shopper leaves for Shopify-hosted checkout. Demo mode stops at `/cart?checkout=demo` and does not collect payment.

## 7. How would you integrate Posti or Matkahuolto?

Keep Shopify checkout for payment. Add a `ShippingProvider` adapter (`getRates`, `createShipment`, `getTracking`) called from a server module after address capture — either Shopify Functions / carrier service, or a post-purchase fulfilment step. Do not call carrier APIs from the browser. See `docs/future-architecture.md`.

## 8. How would you add GA4/GTM?

Set `NEXT_PUBLIC_GTM_ID` (must match `GTM-…`). Events already push a GA4-shaped `dataLayer` payload. Map those event names in GTM. No product-component changes required.

## 9. How do you measure conversion?

Funnel events: `view_item` → `add_to_cart` → `begin_checkout` → `purchase`. Storefront can measure through checkout start reliably. `purchase` should fire from order confirmation (webhook or thank-you), not from clicking Checkout. `/demo/analytics` shows the maths with labelled demo data.

## 10. How did you implement SEO?

Metadata API (titles, descriptions, canonicals, OG/Twitter), `sitemap.ts`, `robots.ts`, semantic headings, crawlable nav, image alt, and JSON-LD for Organization, WebSite, Product, and BreadcrumbList. No fake aggregate ratings.

## 11. What are the main Core Web Vitals risks?

LCP on Shopify CDN images without `priority`/`sizes`. INP if more of the tree becomes client components. CLS if media lacks width/height. Collection pages are dynamic because filters live in the URL — that is correct, but uncached HTML is the LCP surface.

## 12. How would you handle 10x traffic?

Keep catalogue fetches ISR; do not cache carts. Put the storefront behind a CDN. Cap search query length (already done). Add collection pagination. If Shopify 429s, surface `rate_limited` and back off. Horizontal scale is mostly the host; the bottleneck is Storefront API cost.

## 13. How would you add multilingual FI/EN/SV support?

Next.js `[locale]` segment, Shopify Markets / translated resources, hreflang, and money formatting per market. Keep handles stable; translate titles and descriptions. Do not duplicate the catalogue in three code trees.

## 14. How would you add product recommendations?

Start with the existing same-species related set. Then Shopify recommendations or a metafield “pairs with”. Only add a model if retrieval quality is a product requirement. Keep conventional filters either way.

## 15. What would you build next if this became a real business?

In commercial order: connect a live shop and photography; Shopify Email or Klaviyo for restocks; a real `purchase` webhook; collection pagination; then shipping labels (Posti/Matkahuolto) once order volume justifies it. AI search is later — only if query logs show filters failing shoppers.
