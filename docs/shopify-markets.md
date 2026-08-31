# Shopify Markets and currency

Paw & Pine is merchandised as a **Finnish market** shop. Every storefront locale (`/fi`, `/en`, `/sv`) sends Storefront API `@inContext(country: FI, language: FI|EN|SV)`. New carts are created with `buyerIdentity.countryCode: FI`.

Money is formatted with `Intl.NumberFormat` and the **`currencyCode` Shopify returns**. The storefront never rewrites `$` into `€`.

## Required Admin configuration for EUR

If product prices still render as USD, the code is behaving correctly. Set this in Shopify Admin:

1. **Settings → Markets** — Finland (or EU) as the selling market, with **EUR**.
2. Publish Paw & Pine products to the **Headless** sales channel / publication used by this app.
3. Optional: add Finnish (and Swedish) catalogue translations in Shopify. Until those exist, `/fi` uses repository overlays for known Paw & Pine handles. Brand names stay as designed.

Do not invent EUR amounts in the storefront if Shopify only has USD.

## Catalogue scope

Public catalogue queries only return products tagged `catalog:paw-pine` or legacy `paw-pine`. Shopify sample products (snowboards, gift cards, etc.) stay in the development store but are unpublished from listings via tag filter and handle denylist. Do not delete development products.

Re-seed to apply `catalog:paw-pine` on Paw & Pine products:

```bash
npm run seed:shopify
```

Optional: unpublish leftover sample products from the Headless publication with `npm run seed:shopify -- --archive-samples` (archives/unpublishes; it does not delete).
