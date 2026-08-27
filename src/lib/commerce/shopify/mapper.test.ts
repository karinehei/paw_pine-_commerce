import { describe, expect, it } from "vitest";
import { mapProduct } from "@/lib/commerce/shopify/mapper";
import type { ShopifyProductNode } from "@/lib/commerce/shopify/storefront-types";

const fixture: ShopifyProductNode = {
  id: "gid://shopify/Product/1",
  handle: "oakwood-chew-ring",
  title: "Oakwood Chew Ring",
  description: "A turned oak ring.",
  descriptionHtml: "<p>A turned oak ring.</p>",
  vendor: "Pinecraft",
  productType: "Toys",
  tags: ["species:dog", "category:toys", "material:Oak", "bestseller"],
  createdAt: "2025-11-02T08:00:00.000Z",
  availableForSale: true,
  featuredImage: null,
  images: { nodes: [] },
  priceRange: {
    minVariantPrice: { amount: "28.00", currencyCode: "EUR" },
    maxVariantPrice: { amount: "28.00", currencyCode: "EUR" },
  },
  compareAtPriceRange: {
    minVariantPrice: { amount: "34.00", currencyCode: "EUR" },
    maxVariantPrice: { amount: "34.00", currencyCode: "EUR" },
  },
  options: [{ id: "1", name: "Title", values: ["Default Title"] }],
  variants: {
    nodes: [
      {
        id: "gid://shopify/ProductVariant/1",
        title: "Default Title",
        availableForSale: true,
        quantityAvailable: 8,
        selectedOptions: [{ name: "Title", value: "Default Title" }],
        price: { amount: "28.00", currencyCode: "EUR" },
        compareAtPrice: { amount: "34.00", currencyCode: "EUR" },
        image: null,
      },
    ],
  },
};

describe("Shopify product mapper", () => {
  it("maps tags into storefront fields and keeps a visual fallback", () => {
    const product = mapProduct(fixture);
    expect(product.species).toBe("dog");
    expect(product.category).toBe("toys");
    expect(product.material).toBe("Oak");
    expect(product.visual.shape).toBeTruthy();
    expect(product.featuredImage).toBeNull();
  });
});
