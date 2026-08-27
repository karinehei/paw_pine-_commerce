import { describe, expect, it } from "vitest";
import { resolveCheckoutHref } from "@/lib/commerce/checkout";

describe("checkout href", () => {
  it("only follows HTTPS Shopify checkout URLs", () => {
    const live = resolveCheckoutHref(
      "shopify",
      "https://paw-pine.myshopify.com/cart/c/abc",
    );
    expect(live.external).toBe(true);
    expect(live.href).toContain("myshopify.com");

    expect(resolveCheckoutHref("shopify", "https://evil.example/phish")).toEqual({
      href: "/cart?checkout=demo",
      external: false,
    });
  });

  it("keeps demo mode on the in-app boundary", () => {
    expect(resolveCheckoutHref("demo", "https://paw-pine.myshopify.com/cart/c/abc")).toEqual({
      href: "/cart?checkout=demo",
      external: false,
    });
  });
});
