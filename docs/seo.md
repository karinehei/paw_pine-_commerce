# Technical SEO & Product Discovery

The storefront is rendered with the App Router. Catalogue pages are Server Components, so titles, canonicals, and JSON-LD are in the first HTML response. No paid SEO, crawl, or Merchant Center product is required.

## Metadata

| Surface                              | Title / description                   | Canonical                        | Open Graph / Twitter                    |
| ------------------------------------ | ------------------------------------- | -------------------------------- | --------------------------------------- |
| Home                                 | Locale tagline                        | `/fi`, `/en`, `/sv`              | Site-wide OG                            |
| Collections                          | Collection title and copy             | `/{locale}/collections/{handle}` | Image when the collection has one       |
| Products                             | Product title and trimmed description | `/{locale}/products/{handle}`    | Featured image when present             |
| Search                               | Query in the title                    | `/{locale}/search`               | Result pages with a query are `noindex` |
| About, shipping, returns, contact    | Page copy                             | Matching path                    | Summary card                            |
| Cart, `/wishlist`, `/demo/analytics` | —                                     | —                                | `noindex`                               |

Copy is written for humans. There is no keyword stuffing.

## Canonical URLs

`metadataBase` is `NEXT_PUBLIC_SITE_URL`. Product, collection, search, and content helpers set `alternates.canonical` to the **prefixed** path (`/fi/about`, `/en/products/{handle}`). `hreflang` lists `fi`, `en`, `sv`, and `x-default` (Finnish). `/` 308-redirects to `/fi` (or the language cookie) so the same page is not indexed twice. See [i18n.md](./i18n.md).

## Structured data

JSON-LD is typed and serialised with `<` escaped. Product components do not import a third-party SEO SDK.

- **Organization** and **WebSite** (with `SearchAction`) on every page
- **Product** + **Offer** on product pages: name, description, images, SKU when present, brand, price, currency, availability, URL. Empty optional fields are omitted.
- **BreadcrumbList** on product and collection pages, matching the visible breadcrumbs
- **CollectionPage** / **ItemList** on collection pages

Reviews, `aggregateRating`, and invented SKUs are never added.

## Sitemap and robots

`/sitemap.xml` lists home, content pages, collections, and products in Finnish, English, and Swedish. It does not list `/cart`, `/wishlist`, `/demo/analytics`, or API routes. Unprefixed catalogue URLs are omitted because they redirect.

`/robots.txt` allows `/`, points at the sitemap, and disallows `/cart`, `/wishlist`, `/demo/`, and `/api/`. `/api/feeds/` is allowed so a feed fetcher can read the shopping XML; that is not an invitation to index API JSON. `/api/health` stays disallowed; uptime monitors can still request it.

## Google Shopping feed

`GET /api/feeds/google-shopping.xml` builds a Google RSS 2.0 product feed (`xmlns:g="http://base.google.com/ns/1.0"`) from the same catalogue the storefront uses:

- Shopify Storefront products when credentials are present
- Local demo products otherwise

Each item includes id (handle), title, description, link, image_link when an image exists, availability (`in_stock` / `out_of_stock`), price as `12.00 EUR`, brand when present, condition `new`, and product_type. XML is escaped. Rows without a handle, title, or EUR price are dropped rather than emitting broken markup. Catalogue failures return **503** with a small well-formed `<error>` document, not a truncated RSS file. The response is cached (`s-maxage=3600`).

The feed endpoint works without requiring a paid Google service or ad campaign. It is not submitted to Merchant Center from this repository. Opening the URL is enough to review the XML.

## Images and 404

Product `<img>` alt comes from Shopify/demo `altText`, or `{title} from Paw & Pine`. Missing remote images fall back to the still-life SVG. Unknown product and collection handles call `notFound()` (HTTP 404, `noindex`, a single `h1`).
