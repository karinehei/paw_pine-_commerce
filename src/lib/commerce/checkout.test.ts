import { describe, expect, it } from "vitest";
import { resolveCheckoutHref, parseCheckoutTarget } from "@/lib/commerce/checkout";

describe("checkout href", () => {
  it("only follows HTTPS Shopify checkout URLs", () => {
    const live = resolveCheckoutHref(
      "shopify",
      "https://paw-pine.myshopify.com/cart/c/abc",
    );
    expect(live.external).toBe(false);
    expect(live.href).toBe(
      "/checkout?to=https%3A%2F%2Fpaw-pine.myshopify.com%2Fcart%2Fc%2Fabc",
    );

    expect(resolveCheckoutHref("shopify", "https://evil.example/phish")).toEqual({
      href: "/cart?checkout=demo",
      external: false,
    });
  });

  it("rejects non-Shopify checkout targets", () => {
    expect(parseCheckoutTarget("https://evil.example/phish")).toBeNull();
    expect(parseCheckoutTarget("https://paw-pine.myshopify.com/cart/c/abc")).toBe(
      "https://paw-pine.myshopify.com/cart/c/abc",
    );
  });

  it("keeps demo mode on the in-app boundary", () => {
    expect(
      resolveCheckoutHref("demo", "https://paw-pine.myshopify.com/cart/c/abc"),
    ).toEqual({
      href: "/cart?checkout=demo",
      external: false,
    });
  });
});
