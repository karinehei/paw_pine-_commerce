import { describe, expect, it } from "vitest";
import { stripLocalePrefix, withLocale } from "@/lib/i18n/path";

describe("locale paths", () => {
  it("prefixes Finnish routes", () => {
    expect(withLocale("/collections/dogs", "fi")).toBe("/fi/collections/dogs");
    expect(withLocale("/", "fi")).toBe("/fi");
    expect(withLocale("/search?q=oak", "fi")).toBe("/fi/search?q=oak");
  });

  it("keeps English unprefixed", () => {
    expect(withLocale("/fi/collections/dogs", "en")).toBe("/collections/dogs");
    expect(withLocale("/", "en")).toBe("/");
  });

  it("strips the Finnish prefix", () => {
    expect(stripLocalePrefix("/fi")).toBe("/");
    expect(stripLocalePrefix("/fi/cart")).toBe("/cart");
  });
});
