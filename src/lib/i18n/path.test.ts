import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import {
  hreflangLanguages,
  resolveLocaleRouting,
  stripLocalePrefix,
  withLocale,
} from "@/lib/i18n/path";

describe("locale paths", () => {
  it("prefixes every market language", () => {
    expect(withLocale("/collections/dogs", "fi")).toBe("/fi/collections/dogs");
    expect(withLocale("/", "fi")).toBe("/fi");
    expect(withLocale("/search?q=oak", "en")).toBe("/en/search?q=oak");
    expect(withLocale("/fi/products/oakwood-chew-ring", "sv")).toBe(
      "/sv/products/oakwood-chew-ring",
    );
  });

  it("strips any known locale prefix", () => {
    expect(stripLocalePrefix("/fi")).toBe("/");
    expect(stripLocalePrefix("/en/cart")).toBe("/cart");
    expect(stripLocalePrefix("/sv/collections/dogs")).toBe("/collections/dogs");
    expect(stripLocalePrefix("/collections/dogs")).toBe("/collections/dogs");
  });

  it("builds hreflang maps with Finnish as x-default", () => {
    const languages = hreflangLanguages("/products/oakwood-chew-ring");
    expect(languages.fi).toBe("/fi/products/oakwood-chew-ring");
    expect(languages.en).toBe("/en/products/oakwood-chew-ring");
    expect(languages.sv).toBe("/sv/products/oakwood-chew-ring");
    expect(languages["x-default"]).toBe("/fi/products/oakwood-chew-ring");
    expect(DEFAULT_LOCALE).toBe("fi");
  });
});

describe("locale routing", () => {
  it("rewrites prefixed locales and preserves the rest of the path", () => {
    expect(resolveLocaleRouting("/en/products/oakwood-chew-ring")).toEqual({
      kind: "rewrite",
      locale: "en",
      rewritePath: "/products/oakwood-chew-ring",
    });
    expect(resolveLocaleRouting("/sv")).toEqual({
      kind: "rewrite",
      locale: "sv",
      rewritePath: "/",
    });
  });

  it("redirects unprefixed URLs to the default or cookie locale", () => {
    expect(resolveLocaleRouting("/")).toEqual({
      kind: "redirect",
      location: "/fi",
    });
    expect(resolveLocaleRouting("/collections/dogs", "en")).toEqual({
      kind: "redirect",
      location: "/en/collections/dogs",
    });
  });

  it("returns not_found for an unknown two-letter locale", () => {
    expect(resolveLocaleRouting("/de")).toEqual({ kind: "not_found" });
    expect(resolveLocaleRouting("/de/collections/dogs")).toEqual({ kind: "not_found" });
  });
});
