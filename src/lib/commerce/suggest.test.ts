import { describe, expect, it } from "vitest";
import { buildSuggestions } from "@/lib/commerce/suggest";
import { demoCollections, demoProducts } from "@/lib/commerce/demo/catalog";

describe("search suggestions", () => {
  it("returns products and collections for a short query", () => {
    const result = buildSuggestions("harness", demoProducts, demoCollections);
    expect(result.products.some((product) => product.handle.includes("harness"))).toBe(true);
    expect(result.collections.some((collection) => collection.handle === "harnesses")).toBe(true);
  });

  it("ignores one-character queries", () => {
    expect(buildSuggestions("h", demoProducts, demoCollections).products).toHaveLength(0);
  });
});
