import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/vitals/route";
import { parseWebVitalReport } from "@/lib/ops/vitals";

describe("web vital payloads", () => {
  it("accepts a safe LCP report", () => {
    expect(
      parseWebVitalReport({
        name: "LCP",
        value: 2100,
        rating: "good",
        path: "/products/oakwood-chew-ring",
      }),
    ).toMatchObject({ name: "LCP", path: "/products/oakwood-chew-ring" });
  });

  it("strips query strings and rejects PII in the path", () => {
    expect(
      parseWebVitalReport({
        name: "LCP",
        value: 2100,
        rating: "good",
        path: "/search?q=oak",
      }),
    ).toMatchObject({ path: "/search" });
    expect(
      parseWebVitalReport({
        name: "LCP",
        value: 2100,
        rating: "good",
        path: "/x@y",
      }),
    ).toBeNull();
    expect(
      parseWebVitalReport({
        name: "custom",
        value: 1,
        rating: "good",
        path: "/",
      }),
    ).toBeNull();
  });
});

describe("POST /api/vitals", () => {
  it("acknowledges a valid payload", async () => {
    const response = await POST(
      new Request("http://127.0.0.1/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "INP",
          value: 80,
          rating: "good",
          path: "/cart",
        }),
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("rejects an invalid payload", async () => {
    const response = await POST(
      new Request("http://127.0.0.1/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "LCP",
          value: 1,
          rating: "good",
          path: "not-a-path",
        }),
      }),
    );
    expect(response.status).toBe(400);
  });
});
