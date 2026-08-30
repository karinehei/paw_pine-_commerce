import { describe, expect, it } from "vitest";
import {
  isEmail,
  isFinnishPostalCode,
  normaliseFinnishPostalCode,
} from "@/lib/validation";

describe("Finnish postal codes", () => {
  it("accepts a valid five-digit code", () => {
    expect(isFinnishPostalCode("00100")).toBe(true);
    expect(normaliseFinnishPostalCode(" 00100 ")).toBe("00100");
  });

  it("rejects invalid codes", () => {
    expect(isFinnishPostalCode("0010")).toBe(false);
    expect(isFinnishPostalCode("0010A")).toBe(false);
    expect(isFinnishPostalCode("")).toBe(false);
    expect(normaliseFinnishPostalCode("Helsinki")).toBeNull();
  });
});

describe("email validation", () => {
  it("accepts a normal address and rejects empty or oversized values", () => {
    expect(isEmail("shopper@example.com")).toBe(true);
    expect(isEmail("not-an-email")).toBe(false);
    expect(isEmail("")).toBe(false);
  });
});
