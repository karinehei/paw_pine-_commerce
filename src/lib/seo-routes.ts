import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/path";

export const INDEXABLE_CONTENT_PATHS = [
  "/",
  "/about",
  "/shipping",
  "/returns",
  "/contact",
  "/cookies",
  "/search",
] as const;

export const SITEMAP_EXCLUDED_PREFIXES = ["/cart", "/wishlist", "/demo", "/api"] as const;

export const ROBOTS_DISALLOW = ["/cart", "/wishlist", "/demo/", "/api/"] as const;
export const ROBOTS_ALLOW = ["/", "/api/feeds/"] as const;

export function isExcludedFromSitemap(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  return SITEMAP_EXCLUDED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function localizedUrl(site: string, pathname: string, now: Date) {
  return LOCALES.map((locale) => ({
    url: `${site}${withLocale(pathname, locale)}`,
    lastModified: now,
  }));
}

export function buildSitemapEntries({
  site,
  products,
  collections,
  now = new Date(),
}: {
  site: string;
  products: Array<{ handle: string; createdAt: string }>;
  collections: Array<{ handle: string }>;
  now?: Date;
}): MetadataRoute.Sitemap {
  const staticRoutes = INDEXABLE_CONTENT_PATHS.flatMap((pathname) =>
    localizedUrl(site, pathname, now),
  );

  return [
    ...staticRoutes,
    ...collections.flatMap((collection) =>
      localizedUrl(site, `/collections/${collection.handle}`, now),
    ),
    ...products.flatMap((product) =>
      LOCALES.map((locale) => ({
        url: `${site}${withLocale(`/products/${product.handle}`, locale)}`,
        lastModified: new Date(product.createdAt),
      })),
    ),
  ];
}
