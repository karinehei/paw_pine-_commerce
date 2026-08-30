import { describe, expect, it } from "vitest";
import {
  productJsonLd,
  breadcrumbJsonLd,
  websiteJsonLd,
  organizationJsonLd,
} from "@/lib/seo";
import { demoProducts } from "@/lib/commerce/demo/catalog";

describe("structured data", () => {
  it("builds Product JSON-LD without review ratings", () => {
    const product = demoProducts[0];
    expect(product).toBeDefined();
    const json = productJsonLd(
      product!,
      "https://example.com/products/oakwood-chew-ring",
    );

    expect(json["@type"]).toBe("Product");
    expect(json.name).toBe(product!.title);
    expect(json.sku).toBe(product!.sku);
    expect(json.url).toBe("https://example.com/products/oakwood-chew-ring");
    expect((json.offers as { url: string }).url).toBe(
      "https://example.com/products/oakwood-chew-ring",
    );
    expect((json.brand as { name: string }).name).toBe(product!.vendor);
    expect((json.offers as { priceCurrency: string }).priceCurrency).toBe("EUR");
    expect(JSON.stringify(json)).not.toMatch(/aggregateRating|reviewRating/);
  });

  it("builds a BreadcrumbList with positions", () => {
    const json = breadcrumbJsonLd([
      { name: "Home", url: "https://example.com/" },
      { name: "Dogs", url: "https://example.com/collections/dogs" },
    ]);
    const items = json.itemListElement as Array<{ position: number }>;
    expect(json["@type"]).toBe("BreadcrumbList");
    expect(items[0]?.position).toBe(1);
    expect(items[1]?.position).toBe(2);
  });

  it("includes Organization and WebSite search action", () => {
    expect(organizationJsonLd()["@type"]).toBe("Organization");
    const site = websiteJsonLd();
    expect(site["@type"]).toBe("WebSite");
    expect(JSON.stringify(site)).toContain("SearchAction");
  });
});
