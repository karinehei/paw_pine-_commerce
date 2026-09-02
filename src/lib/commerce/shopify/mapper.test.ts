import { describe, expect, it } from "vitest";
import { mapCart, mapProduct, buildShopifySearchQuery } from "@/lib/commerce/shopify/mapper";
import type {
  ShopifyCartNode,
  ShopifyProductNode,
} from "@/lib/commerce/shopify/storefront-types";

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
    expect(product.sku).toBe("oakwood-chew-ring");
    expect(product.dimensions).toBe("See the product images for scale.");
    expect(product.care).toBe("Wipe clean. Avoid harsh chemicals.");
    expect(product.visual.shape).toBeTruthy();
    expect(product.featuredImage).toBeNull();
  });

  it("maps listing nodes that omit variants and description", () => {
    const product = mapProduct({
      ...fixture,
      description: undefined,
      options: undefined,
      variants: undefined,
    });
    expect(product.variants).toEqual([]);
    expect(product.options).toEqual([]);
    expect(product.description).toBe("");
    expect(product.species).toBe("dog");
  });

  it("quotes user search input for Shopify query syntax", () => {
    const query = buildShopifySearchQuery({ query: 'oak" OR title:*' });
    expect(query).toContain('"oak OR title:*"');
    expect(query).toContain('tag:"catalog:paw-pine"');
    expect(query).not.toContain("vendor:");
    expect(query).not.toContain('oak"');
  });
});

describe("Shopify cart mapper", () => {
  const variant = {
    id: "gid://shopify/ProductVariant/1",
    title: "Default Title",
    availableForSale: true,
    selectedOptions: [{ name: "Title", value: "Default Title" }],
    price: { amount: "18.00", currencyCode: "EUR" },
    compareAtPrice: null,
    product: { handle: "felt-mouse-trio", title: "Felt Mouse Trio" },
  };

  it("drops sold-out lines and restores totals from the variant price", () => {
    const node: ShopifyCartNode = {
      id: "gid://shopify/Cart/1",
      checkoutUrl: "https://paw-pine.myshopify.com/cart/c/abc",
      totalQuantity: 0,
      cost: {
        subtotalAmount: { amount: "0.0", currencyCode: "EUR" },
        totalAmount: { amount: "0.0", currencyCode: "EUR" },
      },
      lines: {
        nodes: [
          {
            id: "gid://shopify/CartLine/ghost",
            quantity: 0,
            cost: { totalAmount: { amount: "0.0", currencyCode: "EUR" } },
            merchandise: variant,
          },
          {
            id: "gid://shopify/CartLine/ok",
            quantity: 1,
            cost: { totalAmount: { amount: "0.0", currencyCode: "EUR" } },
            merchandise: variant,
          },
        ],
      },
    };

    const cart = mapCart(node);
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0]?.quantity).toBe(1);
    expect(cart.lines[0]?.cost.totalAmount.amount).toBe("18.00");
    expect(cart.cost.subtotalAmount.amount).toBe("18.00");
    expect(cart.totalQuantity).toBe(1);
  });

  it("skips lines whose merchandise was not a ProductVariant", () => {
    const cart = mapCart({
      id: "gid://shopify/Cart/1",
      checkoutUrl: "https://paw-pine.myshopify.com/cart/c/abc",
      totalQuantity: 1,
      cost: {
        subtotalAmount: { amount: "24.00", currencyCode: "EUR" },
        totalAmount: { amount: "24.00", currencyCode: "EUR" },
      },
      lines: {
        nodes: [
          {
            id: "gid://shopify/CartLine/broken",
            quantity: 1,
            cost: { totalAmount: { amount: "24.00", currencyCode: "EUR" } },
            merchandise: undefined,
          },
        ],
      },
    });
    expect(cart.lines).toHaveLength(0);
    expect(cart.cost.subtotalAmount.amount).toBe("0.00");
  });
});
