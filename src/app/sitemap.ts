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

  const staticRoutes = ["", "/about", "/shipping", "/returns", "/contact", "/search"].map(
    (path) => ({
      url: `${site}${path || "/"}`,
      lastModified: new Date(),
    }),
  );

  return [
    ...staticRoutes,
    ...collections.map((collection) => ({
      url: `${site}/collections/${collection.handle}`,
      lastModified: new Date(),
    })),
    ...products.map((product) => ({
      url: `${site}/products/${product.handle}`,
      lastModified: new Date(product.createdAt),
    })),
  ];
}
