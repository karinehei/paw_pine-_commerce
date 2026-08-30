import { describe, expect, it } from "vitest";
import {
  productJsonLd,
  breadcrumbJsonLd,
  websiteJsonLd,
  organizationJsonLd,
  productMetadata,
  contentMetadata,
} from "@/lib/seo";
import { demoProducts } from "@/lib/commerce/demo/catalog";
import type { Product } from "@/lib/commerce/types";

function oakwood(): Product {
  const product = demoProducts.find((item) => item.handle === "oakwood-chew-ring");
  expect(product).toBeDefined();
  return product!;
}

describe("structured data", () => {
  it("builds Product JSON-LD from catalogue data without review ratings", () => {
    const product = oakwood();
    const json = productJsonLd(product, "https://example.com/products/oakwood-chew-ring");

    expect(json["@type"]).toBe("Product");
    expect(json.name).toBe(product.title);
    expect(json.sku).toBe(product.sku);
    expect(json.url).toBe("https://example.com/products/oakwood-chew-ring");
    expect(json.offers.url).toBe("https://example.com/products/oakwood-chew-ring");
    expect(json.brand?.name).toBe(product.vendor);
    expect(json.offers.priceCurrency).toBe("EUR");
    expect(json.offers.availability).toBe("https://schema.org/InStock");
    expect(JSON.stringify(json)).not.toMatch(/aggregateRating|reviewRating|"review"/);
  });

  it("omits sku, brand, and images when those fields are missing", () => {
    const json = productJsonLd(
      {
        ...oakwood(),
        sku: "  ",
        vendor: "",
        images: [],
        featuredImage: null,
        availableForSale: false,
      },
      "https://example.com/products/oakwood-chew-ring",
    );
    expect(json.sku).toBeUndefined();
    expect(json.brand).toBeUndefined();
    expect(json.image).toBeUndefined();
    expect(json.offers.availability).toBe("https://schema.org/OutOfStock");
  });

  it("builds a BreadcrumbList with positions", () => {
    const json = breadcrumbJsonLd([
      { name: "Home", url: "https://example.com/" },
      { name: "Dogs", url: "https://example.com/collections/dogs" },
    ]);
    expect(json["@type"]).toBe("BreadcrumbList");
    expect(json.itemListElement[0]?.position).toBe(1);
    expect(json.itemListElement[1]?.position).toBe(2);
    expect(json.itemListElement[1]?.item).toBe("https://example.com/collections/dogs");
  });

  it("includes Organization and WebSite search action", () => {
    expect(organizationJsonLd()["@type"]).toBe("Organization");
    const site = websiteJsonLd();
    expect(site["@type"]).toBe("WebSite");
    expect(JSON.stringify(site)).toContain("SearchAction");
  });
});

describe("canonical URLs", () => {
  it("sets a product canonical and Open Graph url for the locale", () => {
    const metadata = productMetadata(oakwood(), "en");
    expect(metadata.alternates?.canonical).toBe("/en/products/oakwood-chew-ring");
    expect(metadata.alternates?.languages).toMatchObject({
      fi: "/fi/products/oakwood-chew-ring",
      en: "/en/products/oakwood-chew-ring",
      sv: "/sv/products/oakwood-chew-ring",
      "x-default": "/fi/products/oakwood-chew-ring",
    });
    expect(metadata.openGraph?.url).toBe("/en/products/oakwood-chew-ring");
  });

  it("sets a content-page canonical with hreflang", () => {
    const metadata = contentMetadata({
      title: "About",
      description: "The house",
      path: "/about",
      locale: "sv",
    });
    expect(metadata.alternates?.canonical).toBe("/sv/about");
    expect(metadata.alternates?.languages?.fi).toBe("/fi/about");
  });
});
