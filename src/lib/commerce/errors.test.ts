import { describe, expect, it } from "vitest";
import { CommerceError, toUserErrorMessage } from "@/lib/commerce/errors";

describe("commerce errors", () => {
  it("maps rate limits and expired carts to shopper copy", () => {
    expect(toUserErrorMessage(new CommerceError("rate_limited"))).toMatch(/busy/i);
    expect(toUserErrorMessage(new CommerceError("invalid_cart"))).toMatch(/add the item again/i);
    expect(toUserErrorMessage(new CommerceError("out_of_stock"))).toMatch(/out of stock/i);
  });

  it("does not leak GraphQL or token details", () => {
    expect(toUserErrorMessage(new Error("X-Shopify-Storefront-Access-Token invalid"))).toBe(
      "Something went wrong. Please try again.",
    );
    expect(toUserErrorMessage(new Error("Shopify-Storefront-Private-Token shfpt_secret"))).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
