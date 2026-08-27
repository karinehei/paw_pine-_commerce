import { describe, expect, it } from "vitest";
import { formatDispatchWindow } from "@/lib/commerce/delivery";

describe("delivery estimate", () => {
  it("skips weekends when counting dispatch days", () => {
    const thursday = new Date(2026, 7, 27, 12, 0, 0);
    expect(formatDispatchWindow(thursday)).toBe("31 Aug–2 Sept");
  });
});
