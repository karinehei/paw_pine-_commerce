import { describe, expect, it } from "vitest";
import { demoProducts } from "@/lib/commerce/demo/catalog";
import { getRelatedProducts, isRelevantRelated } from "@/lib/commerce/related";

function byHandle(handle: string) {
  const product = demoProducts.find((item) => item.handle === handle);
  expect(product).toBeDefined();
  return product!;
}

describe("rule-based recommendations", () => {
  it("ranks same category and tags above other same-species products", () => {
    const current = byHandle("trail-harness");
    const related = getRelatedProducts(current, demoProducts, 4);
    expect(related.map((item) => item.handle)).not.toContain("trail-harness");
    expect(related[0]?.handle).toBe("everyday-walk-harness");
    expect(related.every((item) => item.species === "dog")).toBe(true);
  });

  it("excludes the current product and the other species", () => {
    const current = byHandle("oakwood-chew-ring");
    const related = getRelatedProducts(current, demoProducts, 8);
    expect(related.some((item) => item.handle === "oakwood-chew-ring")).toBe(false);
    expect(related.some((item) => item.species === "cat")).toBe(false);
    expect(related[0]?.handle).toBe("canvas-tug-rope");
  });

  it("does not recommend dog harnesses for a cat scratcher", () => {
    const current = byHandle("sisal-scratch-column");
    const related = getRelatedProducts(current, demoProducts, 4);
    expect(related.every((item) => item.species === "cat")).toBe(true);
    expect(related.some((item) => item.category === "scratching")).toBe(true);
    expect(isRelevantRelated(current, byHandle("trail-harness"))).toBe(false);
  });
});
