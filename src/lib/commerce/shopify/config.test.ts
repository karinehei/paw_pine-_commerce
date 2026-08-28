import { describe, expect, it } from "vitest";
import {
  DEFAULT_STOREFRONT_API_VERSION,
  resolveShopifyConfig,
  sanitiseBuyerIp,
  storefrontEndpoint,
  storefrontRequestHeaders,
} from "@/lib/commerce/shopify/config";
import { collectionOverlayFromHandle } from "@/lib/commerce/shopify/collection-overlay";
import { toStorefrontError } from "@/lib/commerce/shopify/log";

describe("Shopify Storefront config", () => {
  it("enables Shopify mode from a private token and 2026-07", () => {
    const config = resolveShopifyConfig({
      SHOPIFY_STORE_DOMAIN: "paw-pine.myshopify.com",
      SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "shfpt_test",
    });

    expect(config?.tokenKind).toBe("private");
    expect(config?.version).toBe(DEFAULT_STOREFRONT_API_VERSION);
    expect(config?.version).toBe("2026-07");
    expect(storefrontEndpoint(config!)).toBe(
      "https://paw-pine.myshopify.com/api/2026-07/graphql.json",
    );

    const headers = storefrontRequestHeaders(config!, "203.0.113.10");
    expect(headers["Shopify-Storefront-Private-Token"]).toBe("shfpt_test");
    expect(headers["Shopify-Storefront-Buyer-IP"]).toBe("203.0.113.10");
    expect(headers["X-Shopify-Storefront-Access-Token"]).toBeUndefined();
    expect(Object.values(headers).join(" ")).not.toMatch(/NEXT_PUBLIC_/);
  });

  it("stays in demo mode when the private token is missing", () => {
    expect(
      resolveShopifyConfig({
        SHOPIFY_STORE_DOMAIN: "paw-pine.myshopify.com",
      }),
    ).toBeNull();
  });

  it("does not fall back to demo when credentials exist but are invalid", () => {
    expect(() =>
      resolveShopifyConfig({
        SHOPIFY_STORE_DOMAIN: "not-a-shopify-host.example",
        SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "shfpt_test",
      }),
    ).toThrow(/misconfigured/i);

    expect(() =>
      resolveShopifyConfig({
        SHOPIFY_STORE_DOMAIN: "paw-pine.myshopify.com",
        SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "shfpt_test",
        SHOPIFY_STOREFRONT_API_VERSION: "not-a-version",
      }),
    ).toThrow(/misconfigured/i);
  });

  it("does not send the private token in a public header", () => {
    const config = resolveShopifyConfig({
      SHOPIFY_STORE_DOMAIN: "paw-pine.myshopify.com",
      SHOPIFY_STOREFRONT_ACCESS_TOKEN: "public_token",
    });
    expect(config?.tokenKind).toBe("public");
    const headers = storefrontRequestHeaders(config!);
    expect(headers["X-Shopify-Storefront-Access-Token"]).toBe("public_token");
    expect(headers["Shopify-Storefront-Private-Token"]).toBeUndefined();
  });

  it("prefers the private token when both are set", () => {
    const config = resolveShopifyConfig({
      SHOPIFY_STORE_DOMAIN: "paw-pine.myshopify.com",
      SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "private",
      SHOPIFY_STOREFRONT_ACCESS_TOKEN: "public",
    });
    expect(config?.tokenKind).toBe("private");
    expect(storefrontRequestHeaders(config!)["Shopify-Storefront-Private-Token"]).toBe("private");
  });

  it("strips quotes copied from Vercel or .env files", () => {
    const config = resolveShopifyConfig({
      SHOPIFY_STORE_DOMAIN: "paw-pine.myshopify.com",
      SHOPIFY_STOREFRONT_PRIVATE_TOKEN: '"shfpt_test"',
    });
    expect(config?.token).toBe("shfpt_test");
    expect(config?.tokenKind).toBe("private");
  });

  it("treats a quoted Headless public token as Shopify mode, not demo", () => {
    const token = "a".repeat(32);
    const config = resolveShopifyConfig({
      SHOPIFY_STORE_DOMAIN: "paw-pine.myshopify.com",
      SHOPIFY_STOREFRONT_PRIVATE_TOKEN: `"${token}"`,
    });
    expect(config?.token).toBe(token);
    expect(config?.tokenKind).toBe("private");
  });

  it("rejects Admin API tokens", () => {
    expect(() =>
      resolveShopifyConfig({
        SHOPIFY_STORE_DOMAIN: "paw-pine.myshopify.com",
        SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "shpat_admin",
      }),
    ).toThrow(/Storefront API token/i);
  });

  it("rejects an injected buyer IP", () => {
    expect(sanitiseBuyerIp("1.2.3.4, 5.6.7.8")).toBe("1.2.3.4");
    expect(sanitiseBuyerIp("1.2.3.4\r\nX-Evil: 1")).toBeUndefined();
  });
});

describe("Shopify collection overlay", () => {
  it("titles known handles without using demo catalogue copy", () => {
    const collection = collectionOverlayFromHandle("dogs");
    expect(collection.handle).toBe("dogs");
    expect(collection.title).toBe("Dogs");
    expect(collection.id).toContain("overlay");
  });
});

describe("Storefront error mapping", () => {
  it("maps auth failures to unavailable shopper copy", () => {
    const error = toStorefrontError("products", 401);
    expect(error.code).toBe("unavailable");
    expect(error.message).not.toMatch(/token|shfpt|secret/i);
  });
});
