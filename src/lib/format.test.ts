import { describe, expect, it } from "vitest";
import { formatMoney, hasSalePrice, parseAmount } from "@/lib/format";
import { demoProducts } from "@/lib/commerce/demo/catalog";

describe("price formatting", () => {
  it("formats whole euro amounts without cents", () => {
    expect(formatMoney({ amount: "28.00", currencyCode: "EUR" })).toBe("€28");
  });

  it("keeps cents when the amount is not whole", () => {
    expect(formatMoney({ amount: "28.50", currencyCode: "EUR" })).toBe("€28.50");
  });

  it("detects a compare-at sale", () => {
    const product = demoProducts.find((item) => item.handle === "oakwood-chew-ring");
    expect(product).toBeDefined();
    expect(hasSalePrice(product!)).toBe(true);
    expect(parseAmount(product!.priceRange.minVariantPrice)).toBe(28);
  });
});
