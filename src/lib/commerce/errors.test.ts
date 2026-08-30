import { describe, expect, it } from "vitest";
import { CommerceError, toUserErrorMessage } from "@/lib/commerce/errors";

describe("commerce errors", () => {
  it("maps rate limits and expired carts to shopper copy", () => {
    expect(toUserErrorMessage(new CommerceError("rate_limited"), "en")).toMatch(/busy/i);
    expect(toUserErrorMessage(new CommerceError("invalid_cart"), "en")).toMatch(
      /add the item again/i,
    );
    expect(toUserErrorMessage(new CommerceError("out_of_stock"), "en")).toMatch(
      /out of stock/i,
    );
  });

  it("does not leak GraphQL or token details", () => {
    expect(
      toUserErrorMessage(new Error("X-Shopify-Storefront-Access-Token invalid"), "en"),
    ).toBe("Something went wrong. Please try again.");
    expect(
      toUserErrorMessage(
        new Error("Shopify-Storefront-Private-Token shfpt_secret"),
        "en",
      ),
    ).toBe("Something went wrong. Please try again.");
  });
});
