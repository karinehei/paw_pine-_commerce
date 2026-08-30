import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

const TOKEN_KEYS = [
  "SHOPIFY_STORE_DOMAIN",
  "SHOPIFY_STOREFRONT_PRIVATE_TOKEN",
  "SHOPIFY_STOREFRONT_ACCESS_TOKEN",
  "SHOPIFY_STOREFRONT_API_VERSION",
] as const;

function withoutShopifyEnv<T>(run: () => T): T {
  const previous: Partial<Record<(typeof TOKEN_KEYS)[number], string | undefined>> = {};
  for (const key of TOKEN_KEYS) {
    previous[key] = process.env[key];
    delete process.env[key];
  }
  try {
    return run();
  } finally {
    for (const key of TOKEN_KEYS) {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    }
  }
}

describe("GET /api/health", () => {
  it("returns ok with shopify not_configured in demo mode", async () => {
    const response = await withoutShopifyEnv(() => GET());
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    const payload = (await response.json()) as {
      status: string;
      dependencies: { shopify: string };
    };
    expect(payload).toEqual({
      status: "ok",
      dependencies: { shopify: "not_configured" },
    });
    expect(JSON.stringify(payload)).not.toMatch(/token|secret|shfpt|SHOPIFY_/i);
  });
});
