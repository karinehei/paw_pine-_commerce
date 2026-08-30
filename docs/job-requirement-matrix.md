# Job requirement matrix

Hiring audit of Paw & Pine Commerce against a typical ecommerce web-developer brief. Status is **strict**: Strong means a recruiter can open a route and see the work. Partial means the architecture exists but the live capability is incomplete or simulated. Missing means the brief is not demonstrated.

Locales are prefixed (`/fi`, `/en`, `/sv`). Routes below omit the locale.

| Requirement                   | Evidence                                                                                                          | Route                                                       | Code / module                                                                                     | Tests                                                                                           | Type                                                          | Status  |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------- |
| Ecommerce development         | Commerce provider switch, product/collection/cart types, Shopify GraphQL + demo fallback                          | `/`, `/collections/[handle]`, `/products/[handle]`, `/cart` | `src/lib/commerce/`, `src/lib/commerce/shopify/`, `src/lib/commerce/demo/`                        | `src/lib/commerce/*.test.ts`, `e2e/storefront.spec.ts`                                          | Real (Shopify when credentials set; demo catalogue otherwise) | Strong  |
| Website maintenance           | Health probe, ISR catalogue cache, structured logs, CI on every push                                              | `/api/health`                                               | `src/app/api/health/route.ts`, `.github/workflows/ci.yml`, `docs/performance.md`                  | `src/app/api/health/route.test.ts`                                                              | Real                                                          | Strong  |
| Performance optimization      | Slim GraphQL cards, parallel PDP fetches, `next/image`, CWV beacon, Footer as RSC                                 | Catalogue pages                                             | `src/lib/commerce/shopify/`, `src/app/api/vitals/route.ts`, `docs/performance.md`                 | `src/lib/commerce/shopify/*.test.ts`, `src/app/api/vitals/route.test.ts`                        | Real architecture (no paid RUM)                               | Strong  |
| UX improvement                | Filters, search, cart drawer, empty/error states, 44px targets, reduced motion                                    | `/collections/*`, `/search`, `/cart`                        | `src/components/commerce/FilterPanel.tsx`, `EmptyState`, `ErrorState`                             | `e2e/storefront.spec.ts`, `e2e/wishlist.spec.ts`                                                | Real                                                          | Strong  |
| Product pages                 | Gallery, variants, stock, JSON-LD, related products, recently viewed                                              | `/products/[handle]`                                        | `src/app/products/[handle]/page.tsx`, `src/components/product/`                                   | `e2e/storefront.spec.ts`, `src/lib/seo.test.ts`, `src/lib/commerce/related.test.ts`             | Real                                                          | Strong  |
| New ecommerce features        | Wishlist, recently viewed, related ranking, delivery estimator, restock form, newsletter, cookie preferences page | `/wishlist`, `/cart`, `/cookies`                            | `src/lib/wishlist.ts`, `src/lib/recently-viewed.ts`, `src/lib/commerce/related.ts`                | `src/lib/wishlist.test.ts`, `src/lib/recently-viewed.test.ts`, `e2e/simulated-adapters.spec.ts` | Mixed (wishlist real on-device; shipping/email mocked)        | Partial |
| Integrations                  | Shopify Storefront API; provider adapters for shipping, newsletter, restock                                       | Checkout URL, `/api/shipping/rates`                         | `src/lib/commerce/shopify/`, `src/lib/shipping/`, `src/lib/newsletter/`, `src/lib/notifications/` | Shopify mapper tests, `src/lib/shipping/mock.test.ts`, `e2e/simulated-adapters.spec.ts`         | Real Shopify + mock adapters                                  | Partial |
| Technical growth optimization | Typed funnel events, demo analytics page, Merchant-shaped feed                                                    | `/demo/analytics`, `/api/feeds/google-shopping.xml`         | `src/lib/analytics/`, `src/lib/feeds/`                                                            | `src/lib/analytics/*.test.ts`, `src/lib/feeds/*.test.ts`                                        | Real architecture (no live ads account)                       | Partial |
| SEO                           | Metadata, canonicals, hreflang, sitemap, robots, JSON-LD                                                          | All indexable pages, `/sitemap.xml`, `/robots.txt`          | `src/lib/seo.ts`, `src/lib/seo-routes.ts`, `src/app/sitemap.ts`                                   | `src/lib/seo.test.ts`, `src/lib/seo-routes.test.ts`, `e2e/i18n.spec.ts`                         | Real                                                          | Strong  |
| Analytics                     | `track()` union, dataLayer adapter, consent gate, optional GTM snippet                                            | Storefront + `/demo/analytics`                              | `src/lib/analytics/`, `src/components/consent/`                                                   | `src/lib/analytics/*.test.ts`, `src/lib/analytics/consent.test.ts`                              | Real architecture (not production GA4)                        | Strong  |
| Conversion tracking           | Funnel through `begin_checkout`; `purchase` typed but not fired                                                   | Cart CTAs                                                   | `src/lib/analytics/types.ts`, `CheckoutCta`, `CartDrawer`                                         | `src/lib/analytics/events.test.ts`, `e2e/funnel.spec.ts`                                        | Architecture-only for purchase                                | Partial |
| Visual implementation         | Nordic type, linen/pine palette, still-life product art, responsive layout                                        | `/`, collections, PDP                                       | `src/app/globals.css`, `src/components/layout/`, `docs/screenshots/`                              | `e2e/screenshots.spec.ts`                                                                       | Real UI (illustration, not photography)                       | Partial |
| Digital customer experience   | FI/EN/SV routing, GDPR consent, empty/error states, demo shipping estimator                                       | `/fi`, `/en`, `/sv`, `/cookies`                             | `src/lib/i18n/`, `CookieConsent`, `DeliveryEstimate`                                              | `src/lib/i18n/*.test.ts`, `e2e/i18n.spec.ts`                                                    | Real i18n + consent; mock delivery                            | Strong  |

## Responsibility detail

### Ecommerce development — Strong / Real

Shopify Storefront GraphQL is the live catalogue path. Cart mutations are `no-store`. Checkout is a validated Shopify HTTPS URL. Without credentials the app uses a local demo catalogue and a cookie cart so CI and hiring review still work. That fallback is real software, not a fake Shopify call.

**Gap:** collection queries cap at 50 products. No pagination. No Customer Accounts.

### Website maintenance — Strong / Real

`GET /api/health` reports Shopify `ok` / `error` / `not_configured`. GitHub Actions runs lint, typecheck, Vitest, production build, and Playwright in demo mode with no Shopify secrets. Catalogue ISR is 60s.

**Gap:** no rate limits on public POST routes. No CSP. Residual **Medium**.

### Performance optimization — Strong / Architecture

Listing GraphQL requests card fields only. Product pages fetch detail and related ranking in parallel. Images use `next/image` with reserved 4:5 frames. Production posts LCP/INP/CLS to `/api/vitals` (pathname only). No Lighthouse score is claimed.

**Gap:** no paid APM. Vercel Hobby logs only.

### UX improvement — Strong / Real

URL-driven filters and search, native dialogs, skip link, focus-visible pine outline, 44px targets, empty bag / empty search / empty wishlist. Cookie banner and language switcher restack at 375px.

**Gap:** filter brand/material labels are catalogue strings (not translated). Demo analytics funnel chart labels stay English.

### Product pages — Strong / Real

Variant radiogroup, quantity clamp, stock copy, JSON-LD Product (no fabricated ratings), related products from in-process ranking, recently viewed (max 8, localStorage).

**Gap:** related products are not Shopify Product Recommendations API. Photography is original still-life artwork, not studio photos.

### New ecommerce features — Partial

Wishlist and recently viewed are complete on-device features. Delivery estimate, newsletter, restock, and contact are complete **UI + validation + mock adapters**, not merchant services.

### Integrations — Partial

| Integration                    | Type                                      |
| ------------------------------ | ----------------------------------------- |
| Shopify Storefront GraphQL     | Real                                      |
| Shopify cart + hosted checkout | Real when a Dev Store is connected        |
| ShippingProvider               | Mock integration (`MockShippingProvider`) |
| NewsletterProvider             | Mock integration                          |
| NotificationProvider           | Mock integration                          |
| Contact POST                   | Mock integration                          |
| GTM snippet                    | Optional; shop runs without it            |
| Google Merchant Center         | Feed generator only — not submitted       |

### Technical growth optimization — Partial

Merchant XML is generated internally. It is not uploaded to Merchant Center. Analytics events are typed and consent-gated. There is no live ads or SEO SaaS.

### SEO — Strong / Real

SSR metadata, canonicals, hreflang for FI/EN/SV, sitemap, robots (feed allowed, cart/wishlist/demo disallowed), JSON-LD Organization / WebSite / Product / BreadcrumbList.

**Gap:** Open Graph locale in root metadata is still `en_GB` even on Finnish pages (**Medium**).

### Analytics — Strong / Real architecture

Events are a TypeScript discriminated union. UI never imports GA4. `purchase` is in the union and is **not** fired from Checkout. `/demo/analytics` is `noindex` and labelled DEMO DATA.

Do not read that page as production GA4.

### Conversion tracking — Partial / Architecture-only for purchase

Reliable through `begin_checkout`. Hosted checkout is outside this app. A production shop would fire `purchase` from the order status page or a webhook.

### Visual implementation — Partial / Real UI

Credible Nordic storefront at 375 / 768 / 1440. Not a tutorial layout. Still-life SVGs are not a photography brief. Nav mega-menus and drawers use borders, not drop shadows.

### Digital customer experience — Strong / Mixed

Three languages in the repository. Shopify `@inContext` is used for Storefront copy; this repo does not invent live-catalogue translations. GDPR: analytics off until accept. Shipping estimator is a **demo** of Finnish delivery UX, not Posti or Matkahuolto.

## Missing (honest)

| Gap                                       | Why it is missing                             |
| ----------------------------------------- | --------------------------------------------- |
| Collection pagination                     | Catalogue cap 50; not built                   |
| Customer accounts / order history         | Would need Shopify Customer Account API       |
| Live Posti / Matkahuolto labels           | Paid merchant contracts; mock adapter instead |
| Live email (newsletter, restock, contact) | No ESP; mock adapters                         |
| Production GA4 property                   | Optional `NEXT_PUBLIC_GTM_ID` only            |
| `purchase` event in this app              | Shopify-hosted checkout boundary              |
| Merchant Center submission                | XML generator only                            |
| Studio product photography                | Original still-life art                       |
| Content-Security-Policy                   | GTM would need an allowlist; not faked        |
| Rate limiting                             | Documented follow-up in `docs/security.md`    |

## Verdict for this brief

The public portfolio **does** demonstrate ecommerce development, maintenance, performance thinking, PDP craft, SEO, analytics architecture, GDPR, and Shopify integration. It **does not** demonstrate live carrier, ESP, ads, or purchase-pixel operations — and it labels those as mock or architecture-only.
