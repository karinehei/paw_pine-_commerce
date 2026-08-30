import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { getSiteUrl } from "@/lib/env-public";
import { formatMoney } from "@/lib/format";
import type { Collection, Product } from "@/lib/commerce/types";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { localizedAlternates, withLocale } from "@/lib/i18n/path";

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

export function productMetadata(product: Product, locale: Locale): Metadata {
  const title = product.title;
  const description = product.description.replace(/\s+/g, " ").slice(0, 160);
  const path = `/products/${product.handle}`;
  const localized = withLocale(path, locale);
  const image = product.featuredImage;

  return {
    title,
    description,
    alternates: localizedAlternates(path, locale),
    openGraph: {
      type: "website",
      title,
      description,
      url: localized,
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

export function collectionMetadata(collection: Collection, locale: Locale): Metadata {
  const t = getMessages(locale);
  const path = `/collections/${collection.handle}`;
  const localized = withLocale(path, locale);
  const description =
    collection.description ||
    t.collectionMetaFallback.replace("{title}", collection.title);
  const image = collection.image;

  return {
    title: collection.title,
    description,
    alternates: localizedAlternates(path, locale),
    openGraph: {
      type: "website",
      title: collection.title,
      description,
      url: localized,
      images: image
        ? [
            {
              url: image.url,
              alt: image.altText || collection.title,
              width: image.width,
              height: image.height,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: collection.title,
      description,
      images: image ? [image.url] : undefined,
    },
  };
}

export function contentMetadata(options: {
  title: string;
  description: string;
  path: string;
  locale: Locale;
}): Metadata {
  const { title, description, path, locale } = options;
  const localized = withLocale(path, locale);
  return {
    title,
    description,
    alternates: localizedAlternates(path, locale),
    openGraph: {
      type: "website",
      title,
      description,
      url: localized,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export function searchMetadata(term: string | undefined, locale: Locale): Metadata {
  const t = getMessages(locale);
  const title = term ? t.searchMetaTitleQuery.replace("{term}", term) : t.searchMetaTitle;
  const description = term
    ? t.searchMetaDescriptionQuery.replace("{term}", term)
    : t.searchMetaDescription;
  const path = term ? `/search?q=${encodeURIComponent(term)}` : "/search";
  return {
    title,
    description,
    alternates: localizedAlternates("/search", locale),
    robots: { index: !term, follow: true },
    openGraph: {
      title,
      description,
      url: withLocale(path, locale),
    },
  };
}

export interface ProductJsonLd {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description?: string;
  image?: string[];
  url: string;
  sku?: string;
  brand?: { "@type": "Brand"; name: string };
  material?: string;
  offers: {
    "@type": "Offer";
    url: string;
    priceCurrency: string;
    price: string;
    availability: "https://schema.org/InStock" | "https://schema.org/OutOfStock";
    itemCondition: "https://schema.org/NewCondition";
  };
}

export interface BreadcrumbListJsonLd {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

export function productJsonLd(product: Product, url: string): ProductJsonLd {
  const images = product.images.map((image) => image.url).filter(Boolean);
  const sku = product.sku.trim();
  const brand = product.vendor.trim();
  const description = product.description.trim();
  const json: ProductJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode || "EUR",
      price: product.priceRange.minVariantPrice.amount,
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  if (description) {
    json.description = description;
  }
  if (images.length > 0) {
    json.image = images;
  }
  if (sku) {
    json.sku = sku;
  }
  if (brand) {
    json.brand = { "@type": "Brand", name: brand };
  }
  if (product.material.trim()) {
    json.material = product.material;
  }
  return json;
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
): BreadcrumbListJsonLd {
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
  const searchPath = withLocale("/search", DEFAULT_LOCALE);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}${searchPath}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function collectionJsonLd(
  collection: Collection,
  products: Product[],
  url: string,
  locale: Locale = DEFAULT_LOCALE,
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
        url: `${getSiteUrl()}${withLocale(`/products/${product.handle}`, locale)}`,
        name: product.title,
      })),
    },
  };
}

export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function priceLabel(product: Product): string {
  return formatMoney(product.priceRange.minVariantPrice);
}
