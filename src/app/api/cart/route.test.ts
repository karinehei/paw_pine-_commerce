import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { POST } from "@/app/api/cart/route";

function post(body: unknown, origin = "http://127.0.0.1") {
  return POST(
    new Request("http://127.0.0.1/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin,
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /api/cart", () => {
  it("allows a browser-attested same-origin POST without Origin", async () => {
    const response = await POST(
      new Request("http://127.0.0.1/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "sec-fetch-site": "same-origin",
        },
        body: JSON.stringify({
          op: "add",
          variantId: 'gid://shopify/ProductVariant/1"><img src=x>',
          quantity: 1,
        }),
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: false, code: "invalid_cart" });
  });

  it("rejects a missing origin", async () => {
    const response = await POST(
      new Request("http://127.0.0.1/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "add", variantId: "gid://demo/ProductVariant/x" }),
      }),
    );
    expect(response.status).toBe(403);
  });

  it("rejects a cross-site origin", async () => {
    const response = await post(
      { op: "add", variantId: "gid://demo/ProductVariant/x" },
      "https://evil.example",
    );
    expect(response.status).toBe(403);
  });

  it("rejects an unknown operation", async () => {
    const response = await post({ op: "wipe" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, code: "invalid_cart" });
  });

  it("rejects an injected merchandise id without touching Shopify", async () => {
    const response = await post({
      op: "add",
      variantId: 'gid://shopify/ProductVariant/1"><img src=x>',
      quantity: 1,
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: false, code: "invalid_cart" });
  });
});
