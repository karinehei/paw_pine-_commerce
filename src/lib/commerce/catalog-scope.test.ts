import { describe, expect, it } from "vitest";
import { demoProducts } from "@/lib/commerce/demo/catalog";
import {
  filterPawPineCollections,
  filterPawPineProducts,
  isPawPineProduct,
  shopifyCatalogQueryClause,
} from "@/lib/commerce/catalog-scope";
import { applyProductQuery } from "@/lib/commerce/filters";
import { getRelatedProducts } from "@/lib/commerce/related";
import { buildSitemapEntries } from "@/lib/seo-routes";
import { buildGoogleShoppingFeed } from "@/lib/feeds/google-shopping";
import type { Product } from "@/lib/commerce/types";

const snowboard = {
  ...demoProducts[0]!,
  id: "gid://shopify/Product/snowboard",
  handle: "the-complete-snowboard",
  title: "The Complete Snowboard",
  vendor: "Snowboard Vendor",
  tags: ["snowboard", "sport"],
} as Product;

const giftCard = {
  ...demoProducts[0]!,
  id: "gid://shopify/Product/gift",
  handle: "gift-card",
  title: "Gift Card",
  vendor: "Shopify",
  tags: [],
} as Product;

describe("Paw & Pine catalogue scope", () => {
  it("keeps tagged Paw & Pine products and drops Shopify sample handles", () => {
    expect(demoProducts.every(isPawPineProduct)).toBe(true);
    expect(isPawPineProduct(snowboard)).toBe(false);
    expect(isPawPineProduct(giftCard)).toBe(false);
    expect(
      isPawPineProduct({ handle: "oakwood-chew-ring", tags: ["catalog:paw-pine"] }),
    ).toBe(true);
    expect(isPawPineProduct({ handle: "oakwood-chew-ring", tags: ["paw-pine"] })).toBe(
      true,
    );
  });

  it("does not identify the catalogue by vendor name", () => {
    expect(
      isPawPineProduct({
        handle: "the-complete-snowboard",
        tags: ["catalog:paw-pine"],
      }),
    ).toBe(false);
  });

  it("excludes samples from search, listings, related, sitemap, and the Merchant feed", () => {
    const mixed = [snowboard, giftCard, ...demoProducts];
    const listing = filterPawPineProducts(mixed);
    expect(listing.some((product) => product.handle.includes("snowboard"))).toBe(false);
    expect(listing.some((product) => product.handle === "gift-card")).toBe(false);

    const search = applyProductQuery(listing, { query: "snow" });
    expect(search).toHaveLength(0);

    const oak = demoProducts.find((product) => product.handle === "oakwood-chew-ring")!;
    const related = getRelatedProducts(oak, mixed, 8);
    expect(related.every(isPawPineProduct)).toBe(true);

    const sitemap = buildSitemapEntries({
      site: "https://example.com",
      products: listing,
      collections: filterPawPineCollections([
        { handle: "dogs" },
        { handle: "automated-collection" },
      ]),
    });
    const urls = sitemap.map((entry) => entry.url).join(" ");
    expect(urls).not.toContain("snowboard");
    expect(urls).not.toContain("gift-card");
    expect(urls).not.toContain("automated-collection");

    const xml = buildGoogleShoppingFeed({
      siteUrl: "https://example.com",
      products: listing,
    });
    expect(xml).not.toContain("snowboard");
    expect(xml).not.toContain("Gift Card");
    expect(xml).toContain("oakwood-chew-ring");
  });

  it("scopes Storefront product queries by catalogue tag, not vendor", () => {
    expect(shopifyCatalogQueryClause()).toContain('tag:"catalog:paw-pine"');
    expect(shopifyCatalogQueryClause()).toContain('tag:"paw-pine"');
    expect(shopifyCatalogQueryClause()).not.toContain("tag:catalog:paw-pine OR");
    expect(shopifyCatalogQueryClause()).not.toContain("vendor:");
  });
});
