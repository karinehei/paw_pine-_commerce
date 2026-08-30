import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/contact/route";

async function post(body: unknown) {
  return POST(
    new Request("http://127.0.0.1/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /api/contact", () => {
  it("acknowledges a simulated message without sending mail", async () => {
    const response = await post({
      name: "Karin",
      email: "hello@example.com",
      message: "Question about the oak bowl size.",
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, demo: true });
  });

  it("rejects an incomplete form", async () => {
    const response = await post({ name: "", email: "nope", message: "short" });
    expect(response.status).toBe(400);
    const payload = (await response.json()) as { ok: boolean };
    expect(payload.ok).toBe(false);
  });
});
