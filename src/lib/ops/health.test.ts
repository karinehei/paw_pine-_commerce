import { describe, expect, it } from "vitest";
import {
  PRODUCT_CARD_FIELDS,
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
} from "@/lib/commerce/shopify/queries";
import {
  healthFromShopifyStatus,
  httpStatusForHealth,
  probeShopifyStorefront,
} from "@/lib/ops/health";

describe("listing GraphQL fields", () => {
  it("does not request body copy, gallery, options, or variants on cards", () => {
    expect(PRODUCT_CARD_FIELDS).not.toMatch(/descriptionHtml/);
    expect(PRODUCT_CARD_FIELDS).not.toMatch(/\bdescription\b/);
    expect(PRODUCT_CARD_FIELDS).not.toMatch(/variants\(/);
    expect(PRODUCT_CARD_FIELDS).not.toMatch(/\boptions\s*\{/);
    expect(PRODUCTS_QUERY).toContain("first: 50");
    expect(PRODUCT_BY_HANDLE_QUERY).toMatch(/descriptionHtml/);
    expect(PRODUCT_BY_HANDLE_QUERY).not.toMatch(/quantityAvailable/);
    expect(PRODUCT_BY_HANDLE_QUERY.match(/\bimages\s*\(/g)).toHaveLength(1);
  });
});

describe("health mapping", () => {
  it("treats demo as healthy and Shopify failures as degraded", () => {
    expect(healthFromShopifyStatus("not_configured")).toEqual({
      status: "ok",
      dependencies: { shopify: "not_configured" },
    });
    expect(healthFromShopifyStatus("ok")).toEqual({
      status: "ok",
      dependencies: { shopify: "ok" },
    });
    const degraded = healthFromShopifyStatus("error");
    expect(degraded.status).toBe("degraded");
    expect(httpStatusForHealth(degraded)).toBe(503);
    expect(httpStatusForHealth(healthFromShopifyStatus("ok"))).toBe(200);
  });

  it("probes Shopify without exposing shop ids", async () => {
    const result = await probeShopifyStorefront({
      endpoint: "https://example.myshopify.com/api/2026-07/graphql.json",
      headers: { "Content-Type": "application/json" },
      query: "query Health { shop { id } }",
      fetchImpl: (async () =>
        new Response(JSON.stringify({ data: { shop: { id: "gid://shopify/Shop/1" } } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })) as typeof fetch,
    });
    expect(result).toBe("ok");
    expect(result).not.toContain("gid://");
  });

  it("returns error on timeout or non-OK HTTP", async () => {
    await expect(
      probeShopifyStorefront({
        endpoint: "https://example.myshopify.com/api/2026-07/graphql.json",
        headers: {},
        query: "query Health { shop { id } }",
        fetchImpl: (async () => new Response("nope", { status: 500 })) as typeof fetch,
      }),
    ).resolves.toBe("error");

    await expect(
      probeShopifyStorefront({
        endpoint: "https://example.myshopify.com/api/2026-07/graphql.json",
        headers: {},
        query: "query Health { shop { id } }",
        timeoutMs: 10,
        fetchImpl: (async (_url: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_, reject) => {
            init?.signal?.addEventListener("abort", () =>
              reject(Object.assign(new Error("aborted"), { name: "AbortError" })),
            );
          })) as typeof fetch,
      }),
    ).resolves.toBe("error");
  });
});
