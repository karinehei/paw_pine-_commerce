import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/newsletter/route";

async function post(body: unknown) {
  return POST(
    new Request("http://127.0.0.1/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /api/newsletter", () => {
  it("acknowledges a simulated subscribe without sending mail", async () => {
    const response = await post({ email: "reader@example.com" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, demo: true });
  });

  it("rejects an invalid email", async () => {
    const response = await post({ email: "not-an-email" });
    expect(response.status).toBe(400);
    const payload = (await response.json()) as { ok: boolean };
    expect(payload.ok).toBe(false);
  });
});
