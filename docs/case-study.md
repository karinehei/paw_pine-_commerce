# Case study: Paw & Pine

A headless Shopify storefront for a small Scandinavian pet accessories house. Built as a production-shaped prototype: shoppable in demo mode, ready to connect a live store.

## Problem

A new ecommerce business needs a fast, accessible, measurable, and maintainable online store. Catalogue, cart, tax, and payments should not be reinvented. The storefront still has to carry brand, product discovery, SEO, and conversion measurement.

## Objective

Design and implement a modern headless commerce prototype that demonstrates both customer-facing ecommerce quality and the engineering architecture behind it.

## Architecture

```text
Customer
  → Next.js storefront (App Router, React Server Components)
    → Commerce service layer (shared types, provider switch)
      → Shopify Storefront GraphQL API   (private token, server only)
      → Demo catalogue + cookie cart     (when credentials are absent)
        → Products / collections / cart
          → Shopify-hosted checkout
```

Shopify remains the system of record. Next.js owns merchandising, URLs, SEO, analytics events, and the presentation layer. There is no custom order backend.

## Key engineering decisions

**Shopify owns commerce primitives.** Inventory, carts, tax, and PCI checkout are solved problems. Rebuilding them for a portfolio shop would be dishonest and expensive.

**Next.js owns the storefront experience.** App Router and Server Components keep catalogue pages cacheable. Client islands are limited to search, filters, variant selection, and cart.

**Demo mode exists so the work is reviewable.** Missing Storefront credentials must not block hiring review, CI, or a public demo. The UI never imports Shopify or the demo module directly; `getCommerceProvider()` is the only switch.

**Caching is split on purpose.** Catalogue GraphQL uses `revalidate: 60`. Cart queries are `no-store`. The root layout does not read the cart cookie, so product pages are not forced dynamic.

**SEO is a first-class output.** Unique titles, canonicals, Open Graph, robots, a dynamic sitemap, and JSON-LD for Organization, WebSite, Product, and BreadcrumbList. Review ratings are not fabricated. `/api/feeds/google-shopping.xml` is a free Merchant-shaped product feed; it is not submitted to Google from this repo.

**Analytics is vendor-neutral.** A typed ecommerce event union fans out to providers (dataLayer, sessionStorage, optional console). GA4/GTM can be connected later without rewriting product components. Optional analytics stay off until cookie consent.

**Accessibility is part of the purchase path.** Native dialogs, 44px targets, variant radiogroups, cart announcements, and reduced-motion support.

**Tests cover the path a shopper takes.** Vitest for money, variants, filters, structured data, and security helpers. Playwright for home → collection → product → cart → checkout boundary, including search, mobile nav, and out-of-stock behaviour. CI runs in demo mode and does not need Shopify secrets.

## Tradeoffs

### Why not always choose headless?

A conventional Shopify Online Store theme is often the better first choice for a new small ecommerce company. It is faster to launch, cheaper to maintain, and already includes checkout, apps, and merchandising tools. Headless adds a second deploy, an API integration, and the need to rebuild search, SEO, and analytics that a theme would have provided.

This project uses headless because the brief is also to demonstrate storefront engineering, not because every startup should start there.

### When headless becomes justified

- The customer experience must differ materially from a theme
- Product discovery is a core competency (filters, search, merchandising rules)
- Content and brand pages need a custom information architecture
- Performance budgets cannot be met inside the theme stack
- Integrations (ERP, PIM, custom shipping) sit awkwardly on Liquid
- Internationalization or experimentation needs storefront-level control

Until those conditions exist, a theme is the commercially honest default.
