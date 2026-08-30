import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/shipping/rates/route";

async function post(body: unknown) {
  return POST(
    new Request("http://127.0.0.1/api/shipping/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /api/shipping/rates", () => {
  it("returns labelled demo FI rates for a valid postcode", async () => {
    const response = await post({ postalCode: "00100" });
    const payload = (await response.json()) as {
      ok: boolean;
      demo: boolean;
      rates: Array<{ title: string; amount: string; demo: boolean }>;
    };
    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.demo).toBe(true);
    expect(payload.rates.map((rate) => rate.title)).toEqual([
      "Parcel locker",
      "Service point",
      "Home delivery",
    ]);
    expect(payload.rates.map((rate) => rate.amount)).toEqual(["5.90", "6.50", "12.90"]);
    expect(payload.rates.every((rate) => rate.demo)).toBe(true);
  });

  it("rejects an invalid postcode without calling a carrier", async () => {
    const response = await post({ postalCode: "0010" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, message: "invalid_postcode" });
  });

  it("rejects malformed JSON", async () => {
    const response = await post("{");
    expect(response.status).toBe(400);
  });
});
