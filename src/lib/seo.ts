import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { getSiteUrl } from "@/lib/env";
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
  const description = product.description.slice(0, 160);
  const image = product.featuredImage?.url;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/products/${product.handle}`,
      images: image ? [{ url: image, alt: product.featuredImage?.altText ?? title }] : undefined,
    },
  };
}

export function collectionMetadata(collection: Collection): Metadata {
  return {
    title: collection.title,
    description: collection.description,
    alternates: { canonical: `/collections/${collection.handle}` },
  };
}

export function productJsonLd(product: Product, url: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((image) => image.url),
    brand: {
      "@type": "Brand",
      name: product.vendor,
    },
    sku: product.handle,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      price: product.priceRange.minVariantPrice.amount,
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        .toISOString()
        .slice(0, 10),
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>): Record<string, unknown> {
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

export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function priceLabel(product: Product): string {
  return formatMoney(product.priceRange.minVariantPrice);
}
