# Case study: Paw & Pine Commerce

A production-oriented headless Shopify ecommerce portfolio built with Next.js and TypeScript. Public operating cost is approximately **€0/month**. A commercial Shopify store is not free.

## Business challenge

A new Nordic pet accessories house needs a storefront that can be reviewed like a real shop: product discovery, product pages, cart, checkout boundary, SEO, measurement, and accessibility — without inventing a commerce backend and without buying Posti, Klaviyo, or ads accounts solely to pad a portfolio.

The constraint is honesty. Catalogue and checkout should be Shopify’s. Presentation, URLs, and analytics architecture should be the storefront’s. Anything simulated must be labelled as a demo or mock integration.

## Architecture

```text
Customer
  → Next.js storefront (App Router, React Server Components)
    → Commerce service layer (shared types, provider switch)
      → Shopify Storefront GraphQL API   (private token, server only)
      → Demo catalogue + cookie cart     (when credentials are absent)
        → Products / collections / cart
          → Shopify-hosted checkout
    → Provider adapters
      → MockShippingProvider / MockNewsletterProvider / MockNotificationProvider
    → Analytics providers (dataLayer, session, optional GTM after consent)
```

Shopify remains the system of record. Next.js owns merchandising, URLs, SEO, consent, and presentation. There is no custom order backend.

## Why Shopify

Catalogue, inventory, carts, tax, and PCI checkout are solved problems. Rebuilding them for a small merchant would be slower, riskier, and more expensive than using Shopify as the commerce system of record. The Storefront API is a real GraphQL integration a hiring manager can inspect.

## Why Next.js

App Router and React Server Components fit a catalogue that should be cacheable, crawlable, and cheap to render on Hobby hosting. Metadata, sitemap, and `next/image` are first-class. Client islands stay limited to search, filters, variants, cart, and consent.

## Why headless

To own URLs, filters, SEO, analytics events, and visual design independently of Liquid. It is also the right shape for this portfolio: it shows API integration and frontend architecture, not theme tweaking.

Headless is a **choice**, not a default. See [Why standard Shopify might be preferable initially](#why-standard-shopify-might-be-preferable-initially).

## Product discovery

- Collections with URL-driven filters (species, category, brand, material, price, stock, sort)
- Search with query in the URL and typeahead suggestions
- Related products ranked in-process (species, category, tags, collections, price)
- Recently viewed (max 8 handles, this device)
- Google Shopping–shaped XML generated from the live or demo catalogue

Related ranking is not Shopify’s Recommendations API. The Merchant feed is generated here; it is **not** submitted to Merchant Center.

## Ecommerce UX

Product pages carry gallery, variants, stock, dispatch copy, and add-to-bag. The bag is a drawer plus `/cart`. Complimentary-shipping progress is informational; final shipping is Shopify Checkout. Empty bag, empty search, empty wishlist, and error states are first-class. Touch targets are 44px. Drawers use native `<dialog>`.

Wishlist is `localStorage` and is labelled as on-device. It is not a customer account.

## SEO

SSR titles, descriptions, canonicals, Open Graph, hreflang for FI / EN / SV, dynamic sitemap, robots (cart, wishlist, and demo analytics disallowed; the shopping feed allowed). JSON-LD for Organization, WebSite, Product, and BreadcrumbList. Review ratings are not fabricated.

## Analytics

A typed `EcommerceEvent` union fans out to `AnalyticsProvider` implementations. Product components call `track()` only. They do not import GA4. Optional GTM loads only after analytics consent. `/demo/analytics` is `noindex` and labelled **DEMO DATA**. Those figures are not production traffic.

## Conversion tracking

The storefront measures discovery through `begin_checkout` reliably. `purchase` exists in the type system and is **not** fired from the Checkout button. Shopify-hosted checkout is outside this app. A live shop would send `purchase` from the order status page or a webhook.

## Integrations

Shopify Storefront GraphQL is the live commerce integration. Shipping, newsletter, restock, and contact sit behind provider adapters. The adapters in this repository are mocks. That is a **production-ready integration boundary**, not a live carrier or ESP.

## Performance

Catalogue HTML comes from Server Components. Listing queries request card fields only. Product pages fetch in parallel. Images use `next/image` (priority on the home hero and first collection row). Cart GraphQL is `no-store` and is not read in the root layout. Core Web Vitals are posted to `/api/vitals` in production (pathname only). **Do not treat those logs as a Lighthouse score.**

## Accessibility

Skip link, focus-visible outline, native dialogs, labelled language switcher, 44px targets, variant radiogroups, cart status announcements, reduced-motion consideration. Cookie checkboxes are full-row targets.

## Testing

Vitest covers money, variants, filters, structured data, feeds, security helpers, demo shipping, consent, and i18n key lockstep. Playwright covers home → collection → product → cart, search, wishlist, i18n, the conversion funnel, and simulated shipping / restock / newsletter / contact. CI runs in demo mode without Shopify secrets.

## Cost-conscious architecture

Vercel Hobby, GitHub, Shopify Dev Store, Storefront API, test checkout, `localStorage`, repository localization, internally generated Merchant XML, mock adapters. See [docs/free-tier-architecture.md](free-tier-architecture.md). **A paid Shopify plan is required for a real commercial shop.**

## Real integrations

Functionality connected to real Shopify infrastructure when Storefront credentials are present:

- Product and collection catalogue via Storefront GraphQL
- Predictive search / product query
- Cart create / update / lines (uncached)
- `checkoutUrl` to Shopify-hosted checkout (HTTPS host check)
- Shopify `@inContext` language for Storefront copy
- Shopify CDN images when the live catalogue is used

When credentials are absent, a **local demo catalogue** and cookie cart replace those calls. That is still real application code. It is not a mocked Shopify HTTP response pretending to be live.

## Simulated integrations

Intentionally mocked external functionality:

- Finnish delivery rates (Posti / Matkahuolto are **not** called)
- Newsletter email delivery
- Back-in-stock email delivery
- Contact form delivery
- Production GA4 reporting
- Purchase analytics (`purchase` event)
- Google Merchant Center submission

Copy uses **Demo**, **Mock integration**, and **Production-ready integration boundary**. It does not say “fully integrated.”

## Why they are mocked

The goal is to demonstrate integration architecture — typed providers, validation, shopper-facing UX, tests — without purchasing merchant carrier contracts, an ESP, or an ads account solely for a portfolio project. A hiring manager can still see how a real adapter would be swapped in.

## Production path

| Mock                       | Replacement                                                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MockShippingProvider`     | `PostiShippingProvider` / `MatkahuoltoShippingProvider` with server-only credentials, typically as a Shopify carrier service or checkout extension. Final rates stay Shopify’s. |
| `MockNewsletterProvider`   | Shopify Email, Klaviyo, Mailchimp, or Brevo behind `NewsletterProvider`                                                                                                         |
| `MockNotificationProvider` | Same ESP or Shopify Customer API for back-in-stock                                                                                                                              |
| Contact POST               | Helpdesk or transactional mail                                                                                                                                                  |
| dataLayer + empty GTM id   | `NEXT_PUBLIC_GTM_ID` + GA4 tags after consent                                                                                                                                   |
| `purchase` type only       | Order status script or webhook + Measurement Protocol                                                                                                                           |
| Merchant XML endpoint      | Scheduled fetch or Content API into Merchant Center                                                                                                                             |

## Why standard Shopify might be preferable initially

For a new small ecommerce company, Online Store 2.0 is often the better first shop:

- **Lower total cost of ownership** — one system to theme, not a storefront plus an API plus a second deploy
- **Faster launch** — checkout, apps, and merchandising tools already exist
- **Less custom maintenance** — Shopify ships checkout and security patches
- **Lower technical complexity** — no Storefront token, ISR, or headless SEO to own

This repository is headless because the brief is also to demonstrate storefront engineering. If the brief were “sell oak bowls next month with the smallest team,” a theme would be the honest recommendation.

## When headless becomes justified later

- The customer experience must differ materially from a theme
- Product discovery is a core competency (filters, search, merchandising rules)
- Content and brand pages need a custom information architecture
- Performance budgets cannot be met inside the theme stack
- Integrations (ERP, PIM, custom shipping) sit awkwardly on Liquid
- Internationalization or experimentation needs storefront-level control

Until those conditions exist, a theme is the commercially honest default.
