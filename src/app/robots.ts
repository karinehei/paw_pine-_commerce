import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { ROBOTS_ALLOW, ROBOTS_DISALLOW } from "@/lib/seo-routes";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: [...ROBOTS_ALLOW],
      disallow: [...ROBOTS_DISALLOW],
    },
    sitemap: `${site}/sitemap.xml`,
  };
}
