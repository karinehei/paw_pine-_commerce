import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { getSiteUrl } from "@/lib/env-public";
import { formatMoney } from "@/lib/format";
import type { Collection, Product } from "@/lib/commerce/types";

export function siteMetadata(overrides: Metadata = {}): Metadata {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${SITE_NAME} — ${SITE_TAGLINE}`,
      template: `%s — ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    openGraph: {
      type: "website",
      locale: "en_GB",
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
    ...overrides,
  };
}

export function productMetadata(product: Product): Metadata {
  const title = product.title;
  const description = product.description.replace(/\s+/g, " ").slice(0, 160);
  const path = `/products/${product.handle}`;
  const image = product.featuredImage;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title,
      description,
      url: path,
      images: image
        ? [
            {
              url: image.url,
              alt: image.altText || title,
              width: image.width,
              height: image.height,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image.url] : undefined,
    },
  };
}

export function collectionMetadata(collection: Collection): Metadata {
  const path = `/collections/${collection.handle}`;
  const description =
    collection.description || `Shop ${collection.title} at ${SITE_NAME}.`;

  return {
    title: collection.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: collection.title,
      description,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: collection.title,
      description,
    },
  };
}

export function searchMetadata(term?: string): Metadata {
  const title = term ? `Search: ${term}` : "Search";
  const description = term
    ? `Results for “${term}” in the ${SITE_NAME} edit.`
    : `Search the ${SITE_NAME} edit by product, material, or maker.`;
  return {
    title,
    description,
    alternates: { canonical: term ? `/search?q=${encodeURIComponent(term)}` : "/search" },
    robots: { index: !term, follow: true },
  };
}

export function productJsonLd(product: Product, url: string): Record<string, unknown> {
  const images = product.images.map((image) => image.url).filter(Boolean);
  const availability = product.availableForSale
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: images.length > 0 ? images : undefined,
    url,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.vendor,
    },
    material: product.material,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      price: product.priceRange.minVariantPrice.amount,
      availability,
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function organizationJsonLd(): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function collectionJsonLd(
  collection: Collection,
  products: Product[],
  url: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    description: collection.description,
    url,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.slice(0, 16).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${getSiteUrl()}/products/${product.handle}`,
        name: product.title,
      })),
    },
  };
}

export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function priceLabel(product: Product): string {
  return formatMoney(product.priceRange.minVariantPrice);
}
