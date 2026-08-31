import { describe, expect, it } from "vitest";
import {
  buildSitemapEntries,
  isExcludedFromSitemap,
  ROBOTS_ALLOW,
  ROBOTS_DISALLOW,
} from "@/lib/seo-routes";

describe("sitemap exclusions", () => {
  it("excludes cart, demo analytics, and API routes", () => {
    expect(isExcludedFromSitemap("/cart")).toBe(true);
    expect(isExcludedFromSitemap("/checkout")).toBe(true);
    expect(isExcludedFromSitemap("/wishlist")).toBe(true);
    expect(isExcludedFromSitemap("/demo/analytics")).toBe(true);
    expect(isExcludedFromSitemap("/api/feeds/google-shopping.xml")).toBe(true);
    expect(isExcludedFromSitemap("/products/oakwood-chew-ring")).toBe(false);
    expect(isExcludedFromSitemap("/collections/dogs")).toBe(false);
    expect(isExcludedFromSitemap("/about")).toBe(false);
  });

  it("does not include demo or cart URLs in the sitemap", () => {
    const entries = buildSitemapEntries({
      site: "https://example.com",
      products: [{ handle: "oakwood-chew-ring", createdAt: "2026-01-01" }],
      collections: [{ handle: "dogs" }],
      now: new Date("2026-08-30"),
    });
    const urls = entries.map((entry) => entry.url);
    expect(urls).toContain("https://example.com/fi");
    expect(urls).toContain("https://example.com/en");
    expect(urls).toContain("https://example.com/sv");
    expect(urls).toContain("https://example.com/en/about");
    expect(urls).toContain("https://example.com/en/cookies");
    expect(urls).toContain("https://example.com/fi/case-study");
    expect(urls).toContain("https://example.com/sv/collections/dogs");
    expect(urls).toContain("https://example.com/fi/products/oakwood-chew-ring");
    expect(urls).not.toContain("https://example.com/");
    expect(urls).not.toContain("https://example.com/about");
    expect(urls.some((url) => url.includes("/demo"))).toBe(false);
    expect(urls.some((url) => url.includes("/cart"))).toBe(false);
    expect(urls.some((url) => url.includes("/checkout"))).toBe(false);
    expect(urls.some((url) => url.includes("/wishlist"))).toBe(false);
    expect(urls.some((url) => url.includes("/api/"))).toBe(false);
  });

  it("allows the shopping feed to be fetched while still hiding other API routes", () => {
    expect(ROBOTS_ALLOW).toContain("/api/feeds/");
    expect(ROBOTS_DISALLOW).toContain("/api/");
    expect(ROBOTS_DISALLOW).toContain("/checkout");
  });
});
