import type { MetadataRoute } from "next";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import { getSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const commerce = getCatalogProvider();
  const [{ products }, collections] = await Promise.all([
    commerce.getProducts(),
    commerce.getCollections(),
  ]);

  const staticRoutes = [
    "",
    "/about",
    "/shipping",
    "/returns",
    "/contact",
    "/search",
  ].flatMap((path) => {
    const pathname = path || "/";
    return [
      { url: `${site}${pathname === "/" ? "/" : pathname}`, lastModified: new Date() },
      {
        url: `${site}${pathname === "/" ? "/fi" : `/fi${pathname}`}`,
        lastModified: new Date(),
      },
    ];
  });

  return [
    ...staticRoutes,
    ...collections.flatMap((collection) => [
      {
        url: `${site}/collections/${collection.handle}`,
        lastModified: new Date(),
      },
      {
        url: `${site}/fi/collections/${collection.handle}`,
        lastModified: new Date(),
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
