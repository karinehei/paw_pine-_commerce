import { describe, expect, it } from "vitest";
import { buildSuggestions } from "@/lib/commerce/suggest";
import { demoCollections, demoProducts } from "@/lib/commerce/demo/catalog";

describe("search suggestions", () => {
  it("returns products and collections for a short query", () => {
    const result = buildSuggestions("harness", demoProducts, demoCollections);
    expect(result.products.some((product) => product.handle.includes("harness"))).toBe(
      true,
    );
    expect(
      result.collections.some((collection) => collection.handle === "harnesses"),
    ).toBe(true);
  });

  it("ignores one-character queries", () => {
    expect(buildSuggestions("h", demoProducts, demoCollections).products).toHaveLength(0);
  });

  it("does not suggest Shopify sample products", () => {
    const snowboard = {
      ...demoProducts[0]!,
      handle: "the-complete-snowboard",
      title: "The Complete Snowboard",
      tags: ["snowboard"],
    };
    const result = buildSuggestions(
      "snow",
      [snowboard, ...demoProducts],
      demoCollections,
    );
    expect(result.products.some((product) => product.handle.includes("snowboard"))).toBe(
      false,
    );
  });
});
