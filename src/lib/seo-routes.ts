import type { MetadataRoute } from "next";

export const INDEXABLE_CONTENT_PATHS = [
  "/",
  "/about",
  "/shipping",
  "/returns",
  "/contact",
  "/search",
] as const;

export const SITEMAP_EXCLUDED_PREFIXES = ["/cart", "/demo", "/api"] as const;

export const ROBOTS_DISALLOW = ["/cart", "/demo/", "/api/"] as const;
export const ROBOTS_ALLOW = ["/", "/api/feeds/"] as const;

export function isExcludedFromSitemap(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  return SITEMAP_EXCLUDED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
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
  const staticRoutes = INDEXABLE_CONTENT_PATHS.flatMap((pathname) => {
    const fiPath = pathname === "/" ? "/fi" : `/fi${pathname}`;
    return [
      { url: `${site}${pathname === "/" ? "/" : pathname}`, lastModified: now },
      { url: `${site}${fiPath}`, lastModified: now },
    ];
  });

  return [
    ...staticRoutes,
    ...collections.flatMap((collection) => [
      {
        url: `${site}/collections/${collection.handle}`,
        lastModified: now,
      },
      {
        url: `${site}/fi/collections/${collection.handle}`,
        lastModified: now,
      },
    ]),
    ...products.flatMap((product) => [
      {
        url: `${site}/products/${product.handle}`,
        lastModified: new Date(product.createdAt),
      },
      {
        url: `${site}/fi/products/${product.handle}`,
        lastModified: new Date(product.createdAt),
      },
    ]),
  ];
}
