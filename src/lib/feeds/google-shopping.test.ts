import { describe, expect, it } from "vitest";
import { demoProducts } from "@/lib/commerce/demo/catalog";
import {
  buildGoogleShoppingFeed,
  catalogueUnavailableXml,
  formatEurPrice,
  toGoogleShoppingItem,
} from "@/lib/feeds/google-shopping";
import { escapeXml } from "@/lib/feeds/xml";
import { moneyFromNumber } from "@/lib/format";
import type { Product } from "@/lib/commerce/types";

function productByHandle(handle: string): Product {
  const product = demoProducts.find((item) => item.handle === handle);
  expect(product).toBeDefined();
  return product!;
}

describe("Google Shopping feed", () => {
  it("escapes XML special characters", () => {
    expect(escapeXml(`Oak & Pine <toy> "quote" 'apos'`)).toBe(
      "Oak &amp; Pine &lt;toy&gt; &quot;quote&quot; &apos;apos&apos;",
    );
  });

  it("formats EUR prices with two decimals", () => {
    expect(formatEurPrice(moneyFromNumber(28))).toBe("28.00 EUR");
    expect(formatEurPrice({ amount: "12.5", currencyCode: "EUR" })).toBe("12.50 EUR");
    expect(formatEurPrice({ amount: "10.00", currencyCode: "USD" })).toBeNull();
    expect(formatEurPrice({ amount: "nope", currencyCode: "EUR" })).toBeNull();
  });

  it("maps a real demo product with EUR, brand, and availability", () => {
    const item = toGoogleShoppingItem(
      productByHandle("oakwood-chew-ring"),
      "https://example.com",
    );
    expect(item).toMatchObject({
      id: "oakwood-chew-ring",
      title: "Oakwood Chew Ring",
      link: "https://example.com/fi/products/oakwood-chew-ring",
      availability: "in_stock",
      price: "28.00 EUR",
      condition: "new",
      productType: "toys",
    });
    expect(item?.brand).toBeTruthy();
    expect(item?.imageLink).toBe("https://example.com/products/oakwood-chew-ring.svg");
  });

  it("marks unavailable products as out of stock and skips malformed rows", () => {
    const soldOut = toGoogleShoppingItem(
      { ...productByHandle("oakwood-chew-ring"), availableForSale: false, vendor: "" },
      "https://example.com",
    );
    expect(soldOut?.availability).toBe("out_of_stock");
    expect(soldOut?.brand).toBeUndefined();

    expect(
      toGoogleShoppingItem(
        {
          ...productByHandle("oakwood-chew-ring"),
          handle: "",
          title: "",
        },
        "https://example.com",
      ),
    ).toBeNull();

    expect(
      toGoogleShoppingItem(
        {
          ...productByHandle("oakwood-chew-ring"),
          priceRange: {
            minVariantPrice: { amount: "12", currencyCode: "USD" },
            maxVariantPrice: { amount: "12", currencyCode: "USD" },
          },
        },
        "https://example.com",
      ),
    ).toBeNull();
  });

  it("builds well-formed RSS with escaped titles and no silent truncation", () => {
    const nasty: Product = {
      ...productByHandle("oakwood-chew-ring"),
      title: "Oak & Pine <script>alert(1)</script>",
      description: "A toy for dogs & cats.",
    };
    const xml = buildGoogleShoppingFeed({
      siteUrl: "https://example.com",
      products: [nasty, productByHandle("trail-harness")],
    });

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">');
    expect(xml).toContain("<g:id>oakwood-chew-ring</g:id>");
    expect(xml).toContain("<g:price>28.00 EUR</g:price>");
    expect(xml).toContain("<g:availability>in_stock</g:availability>");
    expect(xml).toContain("Oak &amp; Pine &lt;script&gt;alert(1)&lt;/script&gt;");
    expect(xml).not.toContain("<script>");
    expect(xml).toContain("</channel></rss>");
    expect(xml.match(/<item>/g)?.length).toBe(2);
  });

  it("omits image_link when no image exists", () => {
    const xml = buildGoogleShoppingFeed({
      siteUrl: "https://example.com",
      products: [
        {
          ...productByHandle("oakwood-chew-ring"),
          featuredImage: null,
          images: [],
        },
      ],
    });
    expect(xml).not.toContain("<g:image_link>");
    expect(xml).toContain("<g:id>oakwood-chew-ring</g:id>");
  });

  it("returns well-formed XML when the catalogue is unavailable", () => {
    const xml = catalogueUnavailableXml();
    expect(xml.startsWith("<?xml ")).toBe(true);
    expect(xml).toContain("<error>");
    expect(xml).toContain("</error>");
  });
});
