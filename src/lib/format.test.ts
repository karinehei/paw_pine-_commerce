import { describe, expect, it } from "vitest";
import { formatMoney, hasSalePrice, parseAmount, savingsMoney } from "@/lib/format";
import { demoProducts } from "@/lib/commerce/demo/catalog";

describe("price formatting", () => {
  it("formats with Shopify currencyCode and two fraction digits", () => {
    expect(formatMoney({ amount: "28.00", currencyCode: "EUR" }, "en-GB")).toBe("€28.00");
    expect(formatMoney({ amount: "28.50", currencyCode: "EUR" }, "en-GB")).toBe("€28.50");
    expect(formatMoney({ amount: "24.00", currencyCode: "EUR" }, "fi-FI")).toMatch(
      /24,00/,
    );
    expect(formatMoney({ amount: "28.00", currencyCode: "USD" }, "en-GB")).toMatch(
      /28\.00/,
    );
    expect(formatMoney({ amount: "28.00", currencyCode: "USD" }, "en-GB")).toMatch(/\$/);
  });

  it("does not rewrite a foreign currency into euros", () => {
    const usd = formatMoney({ amount: "28.00", currencyCode: "USD" }, "fi-FI");
    expect(usd).not.toMatch(/€/);
    expect(usd).toMatch(/28/);
  });

  it("computes a compare-at saving in the listing currency", () => {
    const saved = savingsMoney(
      { amount: "28.00", currencyCode: "EUR" },
      { amount: "34.00", currencyCode: "EUR" },
    );
    expect(saved).toEqual({ amount: "6.00", currencyCode: "EUR" });
  });

  it("detects a compare-at sale", () => {
    const product = demoProducts.find((item) => item.handle === "oakwood-chew-ring");
    expect(product).toBeDefined();
    expect(hasSalePrice(product!)).toBe(true);
    expect(parseAmount(product!.priceRange.minVariantPrice)).toBe(28);
  });
});
