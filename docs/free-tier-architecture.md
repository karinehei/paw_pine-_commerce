# Free-tier architecture

This document is the cost audit for the **public portfolio**. It is not a quote for running a commercial Shopify shop.

**Portfolio architecture: approximately €0/month operating cost.**

A real commercial store would require a **paid Shopify plan** and, depending on the merchant, paid apps, carriers, email, and ads. That is production opex. It is not this repository’s hosting bill.

## Intended €0 portfolio stack

| Piece                                             | Monthly cost (portfolio) |
| ------------------------------------------------- | ------------------------ |
| Shopify Dev Store                                 | €0                       |
| Vercel Hobby                                      | €0                       |
| GitHub                                            | €0                       |
| Next.js                                           | €0                       |
| TypeScript                                        | €0                       |
| Playwright                                        | €0                       |
| Vitest                                            | €0                       |
| GTM-ready analytics (no required GTM/GA4 account) | €0                       |
| Local wishlist (`localStorage`)                   | €0                       |
| Demo shipping (`MockShippingProvider`)            | €0                       |
| Merchant XML feed (generated in-repo)             | €0                       |
| Localization (repository JSON)                    | €0                       |

## External dependencies

| Dependency                            | Purpose                                 | Costs money?                                               | Account required?               | Works without account?                 | Production replacement                                |
| ------------------------------------- | --------------------------------------- | ---------------------------------------------------------- | ------------------------------- | -------------------------------------- | ----------------------------------------------------- |
| Next.js                               | App Router storefront                   | No (MIT)                                                   | No                              | Yes                                    | Same                                                  |
| React / React DOM                     | UI                                      | No (MIT)                                                   | No                              | Yes                                    | Same                                                  |
| TypeScript                            | Types                                   | No (Apache-2.0)                                            | No                              | Yes                                    | Same                                                  |
| Tailwind CSS                          | Styles                                  | No                                                         | No                              | Yes                                    | Same                                                  |
| `server-only`                         | Prevent client leaks of server modules  | No                                                         | No                              | Yes                                    | Same                                                  |
| Vitest                                | Unit tests                              | No                                                         | No                              | Yes                                    | Same                                                  |
| Playwright                            | E2E + screenshots                       | No                                                         | No                              | Yes                                    | Same                                                  |
| ESLint / Prettier                     | Lint and format                         | No                                                         | No                              | Yes                                    | Same                                                  |
| GitHub (repo + Actions)               | Source and CI                           | No on public/private hobby use in this project             | GitHub account to push          | Local `npm` scripts still run          | Same, or another git host                             |
| Vercel Hobby                          | Host the Next.js app                    | No on Hobby, within fair-use                               | Vercel account to deploy        | `next start` locally                   | Vercel Pro, or another Node host                      |
| Shopify Dev Store                     | Catalogue, cart, test checkout          | No for Dev Store                                           | Shopify Partner / Dev Dashboard | **Yes** — demo catalogue + cookie cart | **Paid Shopify plan** + live store                    |
| Shopify Storefront API                | Products, collections, search, cart     | Included with the shop                                     | Storefront private token        | Demo mode if domain/token absent       | Same API on a paid shop                               |
| Shopify-hosted checkout               | PCI payment                             | Test checkout on Dev Store                                 | Connected shop                  | Demo stops at `/cart?checkout=demo`    | Paid plan + real payments                             |
| Shopify Admin API                     | `npm run seed:shopify` only             | Dev Store                                                  | Client ID/secret locally        | Storefront runs without seed           | Merchant admin / PIM                                  |
| Browser `localStorage`                | Wishlist, recently viewed               | No                                                         | No                              | Yes                                    | Optional Customer Account API                         |
| `sessionStorage`                      | Demo analytics session copy             | No                                                         | No                              | Yes                                    | GA4 / warehouse                                       |
| First-party cookies                   | Cart id, locale, consent                | No                                                         | No                              | Yes                                    | Same                                                  |
| Repository locales (`locales/*.json`) | FI / EN / SV UI                         | No                                                         | No                              | Yes                                    | Shopify Markets + translators                         |
| Internally generated Merchant XML     | `/api/feeds/google-shopping.xml`        | No                                                         | No                              | Yes                                    | Google Merchant Center (Google account; ads optional) |
| Optional `NEXT_PUBLIC_GTM_ID`         | Inject GTM after consent                | GTM itself is free; GA4 is free-tier until Google’s limits | Only if you want live tags      | **Yes** — shop does not require GTM    | GA4 property + GTM container                          |
| Mock shipping adapter                 | Finnish postcode estimator              | No                                                         | No                              | Yes                                    | Posti / Matkahuolto **merchant contracts** (paid)     |
| Mock newsletter adapter               | Footer signup                           | No                                                         | No                              | Yes                                    | Klaviyo / Mailchimp / Shopify Email (usually paid)    |
| Mock restock adapter                  | Back-in-stock form                      | No                                                         | No                              | Yes                                    | Same ESP or Shopify Customer API                      |
| Contact POST                          | Validates a message                     | No                                                         | No                              | Yes                                    | Helpdesk or mailbox                                   |
| Google fonts via `next/font`          | Outfit + Fraunces, self-hosted at build | No                                                         | No                              | Yes                                    | Same                                                  |
| Shopify CDN images                    | Product media when live                 | Included with shop                                         | Live shop                       | Demo uses in-repo still lifes          | Same                                                  |

## What is not in this repo (on purpose)

These would break the €0 portfolio constraint or fake a paid integration:

- Posti or Matkahuolto production APIs
- Mailchimp, Klaviyo, Resend, SendGrid
- Sentry, Datadog, Vercel Speed Insights (paid/add-on)
- Google Merchant Center upload automation
- A production GA4 property as a required runtime

## Portfolio vs production opex

### Portfolio (this project)

- Host: Vercel Hobby
- Commerce sandbox: Shopify Dev Store
- Measurement: typed events + optional empty GTM id
- Shipping/email: mock adapters
- Feed: generated XML, not submitted

**Recurring cost: €0/month**, assuming Hobby and Dev Store remain within their free terms.

### Production (a real merchant)

| Item                                  | Typical cost                      |
| ------------------------------------- | --------------------------------- |
| Shopify plan (Basic and up)           | Paid monthly — **not free**       |
| Transaction / payment fees            | Per Shopify and PSP               |
| Domain                                | Annual                            |
| Posti / Matkahuolto                   | Contract + per-parcel             |
| Email / SMS                           | ESP plan                          |
| Apps (reviews, subscriptions, search) | Often paid                        |
| Ads / Merchant Center campaigns       | Optional, not free at scale       |
| Headless hosting beyond Hobby         | Possible Vercel Pro or equivalent |
| Photography, packing, returns         | Operations, not SaaS              |

Headless does **not** remove the Shopify plan. It adds a storefront to maintain.

## Environment variables and money

| Variable                           | Needed for €0 demo?                  | Needed for live catalogue?   |
| ---------------------------------- | ------------------------------------ | ---------------------------- |
| `NEXT_PUBLIC_SITE_URL`             | For correct canonicals in production | Yes                          |
| `SHOPIFY_STORE_DOMAIN`             | No                                   | Yes                          |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | No                                   | Yes                          |
| `NEXT_PUBLIC_GTM_ID`               | No                                   | Only if using GTM            |
| `SHOPIFY_CLIENT_ID` / `SECRET`     | No                                   | Seed script only, not Vercel |

No feature secretly fails closed because a paid SaaS key is missing. Missing Shopify credentials select demo mode. Missing GTM id skips the snippet. Missing ESP is the mock newsletter.
