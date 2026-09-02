import { describe, expect, it } from "vitest";
import {
  clampQuantity,
  clampSearchQuery,
  isGtmId,
  isMerchandiseId,
  isCartLineId,
  isProductHandle,
  isSameOriginRequest,
  isShopifyCartGid,
  isShopifyCheckoutUrl,
  isShopifyStoreDomain,
  normaliseShopifyDomain,
  quoteShopifySearchTerm,
  sanitiseFilterValue,
} from "@/lib/security";

describe("security helpers", () => {
  it("accepts only Shopify store domains", () => {
    expect(normaliseShopifyDomain("https://paw-pine.myshopify.com")).toBe(
      "paw-pine.myshopify.com",
    );
    expect(normaliseShopifyDomain("evil.com")).toBeNull();
    expect(isShopifyStoreDomain("paw-pine.myshopify.com")).toBe(true);
  });

  it("rejects off-platform checkout URLs", () => {
    expect(isShopifyCheckoutUrl("https://paw-pine.myshopify.com/cart/c/abc")).toBe(true);
    expect(isShopifyCheckoutUrl("https://evil.example/phish")).toBe(false);
    expect(isShopifyCheckoutUrl("http://paw-pine.myshopify.com/cart/c/abc")).toBe(false);
    expect(isShopifyCheckoutUrl("/cart?checkout=demo")).toBe(false);
  });

  it("quotes search terms so Shopify operators cannot be injected", () => {
    expect(quoteShopifySearchTerm('oak" OR title:*')).toBe('"oak OR title:*"');
  });

  it("validates handles, GTM IDs, and cart GIDs", () => {
    expect(isProductHandle("trail-harness")).toBe(true);
    expect(isProductHandle("../admin")).toBe(false);
    expect(isGtmId("GTM-ABC123")).toBe(true);
    expect(isGtmId("GTM-abc');alert(1)//")).toBe(false);
    expect(isShopifyCartGid("gid://shopify/Cart/1")).toBe(true);
    expect(isShopifyCartGid("gid://shopify/Product/1")).toBe(false);
  });

  it("accepts shop and demo merchandise and line ids", () => {
    expect(isMerchandiseId("gid://shopify/ProductVariant/123")).toBe(true);
    expect(isMerchandiseId("gid://demo/ProductVariant/ceramic-dish-one-size")).toBe(
      true,
    );
    expect(isMerchandiseId("gid://shopify/Product/123")).toBe(false);
    expect(isMerchandiseId('gid://shopify/ProductVariant/1"><script>')).toBe(false);
    expect(isCartLineId("gid://shopify/CartLine/abc")).toBe(true);
    expect(isCartLineId("demo-line-1")).toBe(true);
    expect(isCartLineId("gid://shopify/Cart/1")).toBe(false);
  });

  it("rejects cross-origin cart requests", () => {
    const url = "https://paw-pine-commerce.vercel.app/api/cart";
    expect(
      isSameOriginRequest(
        new Request(url, {
          method: "POST",
          headers: { origin: "https://paw-pine-commerce.vercel.app" },
        }),
      ),
    ).toBe(true);
    expect(
      isSameOriginRequest(
        new Request(url, {
          method: "POST",
          headers: { origin: "https://evil.example" },
        }),
      ),
    ).toBe(false);
    expect(isSameOriginRequest(new Request(url, { method: "POST" }))).toBe(false);
    expect(
      isSameOriginRequest(new Request(url, { method: "GET" }), {
        requireOrigin: false,
      }),
    ).toBe(true);
  });

  it("clamps queries, filter values, and quantities", () => {
    expect(clampSearchQuery("  harness  ")).toBe("harness");
    expect(clampSearchQuery("x".repeat(200))?.length).toBe(80);
    expect(sanitiseFilterValue("Oak!")).toBe("Oak");
    expect(clampQuantity(500, 3)).toBe(3);
    expect(clampQuantity(0)).toBe(1);
  });
});
