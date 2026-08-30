# Security notes

This storefront is a portfolio prototype. It is not a claim that the application is secure in absolute terms. The notes below record what was checked and what was mitigated.

## Secrets and environment

- `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` is server-only (`src/lib/env.ts` imports `server-only`). Private tokens are sent as `Shopify-Storefront-Private-Token`. If Shopify responds 401, the client retries once with `X-Shopify-Storefront-Access-Token` (Headless public tokens are often pasted into this env var). The retry is not cached and is not a demo-catalogue fallback. Never `NEXT_PUBLIC_*`.
- Admin API tokens (`shpat_`, `shpca_`) cannot call the Storefront API. A 401 log may include `hint=use_headless_storefront_private_token`. Do not put Admin or Storefront tokens on the client.
- Store domain is accepted only if it matches `*.myshopify.com`. A poisoned env value cannot send the token to an arbitrary host.
- API version must match `YYYY-MM`.
- `.env*` is gitignored; `.env.example` has empty token fields.
- CI runs in demo mode and does not inject Shopify secrets.

## Browser bundle

- No `SHOPIFY_*` variables are `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_GTM_ID` is interpolated into a script only after `/^GTM-[A-Z0-9]+$/i` validation **and** explicit analytics cookie consent.

## Checkout redirects

- `cart.checkoutUrl` is used as an `<a href>` only when it is `https:` and on a Shopify host.
- Other values fall back to `/cart?checkout=demo`.
- External checkout links set `rel="noopener noreferrer"`.
- Filter `router.push` paths must be site-relative (`/` but not `//`).

## XSS and HTML

- Product copy is rendered as text, not `descriptionHtml`.
- JSON-LD is serialised with `<` escaped before `dangerouslySetInnerHTML`.
- Recently viewed handles must match `^[a-z0-9]+(?:-[a-z0-9]+)*$` before they become `/products/{handle}` links.

## GraphQL

- Query documents are static strings. User input is passed as variables.
- Shopify product-search syntax is quoted (`quoteShopifySearchTerm`) so `OR` / `title:*` in `q` cannot widen the query.
- Search `q` is clamped to 80 characters. Suggest API rejects longer strings.

## Cart cookie

- `httpOnly`, `sameSite=lax`, `secure` in production.
- Shopify ids must be `gid://shopify/Cart/…`.
- Demo lines must use `demo-line-` ids and quantities 1–99.

## Consent cookie

- `paw_pine_consent` is first-party, not `httpOnly` (the banner must read it), `SameSite=Lax`, 180 days.
- Values are only `necessary` or `analytics`. It records the choice; it is not a tracking pixel.

## Forms

- Contact, newsletter, and back-in-stock validate email server-side and acknowledge only. No mailbox or ESP is called. Finnish postcodes must match `^[0-9]{5}$`. Product handles for restock alerts must match the handle pattern.
- Wishlist and recently viewed store only catalogue handles and merchandising fields in `localStorage`. Handles are validated before write. There is no Customer Account API and no wishlist database.
- These routes acknowledge receipt only; they do not persist PII and do not log email addresses. Add a provider and rate limits before production use.

## Logging

- Storefront failures log `[storefront] operation code http_status` plus a JSON object with `event`, `operation`, `code`, and `http_status` only. Tokens, headers, query documents, GraphQL bodies, cart ids, emails, and buyer IPs are never logged.
- Health logs `[health] {"status","shopify"}`. Web vitals log `[cwv] {"name","value","rating","path"}`. Paths are pathnames only.
- GraphQL error bodies and tokens are not returned to the client.
- Shopper-facing copy is mapped from `CommerceError.code` in `toUserErrorMessage`.
- The analytics debug adapter logs event names and typed payloads — not secrets.

## Headers

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy` disables camera, microphone, geolocation

A Content-Security-Policy is not set: GTM/GA4 would need a carefully maintained allowlist. That is a follow-up, not a silent false sense of safety.

## Residual risk

- Storefront tokens are still powerful; leak of `.env.local` is a shop compromise.
- Demo cart cookies are unsigned; they can only add known demo variants.
- No rate limiting on `/api/contact`, `/api/newsletter`, `/api/notify-stock`, or `/api/shipping/rates`.
- Dependency audit is not automated beyond `npm ci` of a short lockfile.
