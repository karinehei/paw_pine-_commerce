import { describe, expect, it } from "vitest";
import {
  addDemoLine,
  hydrateDemoCart,
  updateDemoLine,
} from "@/lib/commerce/demo/cart";
import { demoProducts } from "@/lib/commerce/demo/catalog";
import { CommerceError } from "@/lib/commerce/errors";
import { formatMoney, parseAmount } from "@/lib/format";
import { isEmail } from "@/lib/validation";
import { findVariant } from "@/lib/commerce/variants";

describe("demo cart", () => {
  it("adds a variant and computes subtotal", () => {
    const variant = demoProducts[0]?.variants[0];
    expect(variant).toBeDefined();
    const records = addDemoLine([], { variantId: variant!.id, quantity: 2 });
    const cart = hydrateDemoCart("demo-cart-test", records);

    expect(cart.totalQuantity).toBe(2);
    expect(parseAmount(cart.cost.subtotalAmount)).toBe(parseAmount(variant!.price) * 2);
  });

  it("removes a line when quantity is zero", () => {
    const variant = demoProducts[0]?.variants[0];
    const records = addDemoLine([], { variantId: variant!.id, quantity: 1 });
    const lineId = records[0]?.id ?? "";
    const updated = updateDemoLine(records, lineId, 0);
    expect(updated).toHaveLength(0);
  });

  it("rejects unknown variants", () => {
    expect(() => addDemoLine([], { variantId: "missing", quantity: 1 })).toThrow(CommerceError);
  });
});

describe("formatMoney", () => {
  it("formats whole euro amounts without decimals", () => {
    expect(formatMoney({ amount: "42.00", currencyCode: "EUR" })).toMatch(/42/);
  });
});

describe("validation", () => {
  it("accepts a simple email", () => {
    expect(isEmail("hello@pawandpine.com")).toBe(true);
    expect(isEmail("not-an-email")).toBe(false);
  });
});

describe("variants", () => {
  it("finds a sized harness variant", () => {
    const harness = demoProducts.find((product) => product.handle === "trail-harness");
    expect(harness).toBeDefined();
    const variant = findVariant(harness!, { Size: "M" });
    expect(variant?.availableForSale).toBe(true);
    expect(findVariant(harness!, { Size: "XL" })?.availableForSale).toBe(false);
  });
});
