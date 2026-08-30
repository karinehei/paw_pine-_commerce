import type { MetadataRoute } from "next";
import { getCatalogProvider } from "@/lib/commerce/catalog";
import { getSiteUrl } from "@/lib/env";
import { buildSitemapEntries } from "@/lib/seo-routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const commerce = getCatalogProvider();
  const [{ products }, collections] = await Promise.all([
    commerce.getProducts(),
    commerce.getCollections(),
  ]);

  return buildSitemapEntries({
    site: getSiteUrl(),
    products,
    collections,
  });
}
