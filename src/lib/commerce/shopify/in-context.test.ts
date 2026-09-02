import { describe, expect, it } from "vitest";
import { usesStorefrontInContext, withStorefrontInContext } from "@/lib/commerce/shopify/in-context";

describe("Shopify storefront context", () => {
  it("injects country and language @inContext on queries with variables", () => {
    const next = withStorefrontInContext(
      "query Products($query: String) { products { nodes { id } } }",
    );
    expect(next).toContain("$country: CountryCode");
    expect(next).toContain("$language: LanguageCode");
    expect(next).toContain("@inContext(country: $country, language: $language)");
  });

  it("injects @inContext on queries without variables", () => {
    const next = withStorefrontInContext(
      "query Collections { collections { nodes { id } } }",
    );
    expect(next).toContain(
      "query Collections($country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language)",
    );
  });

  it("does not wrap cart operations with @inContext", () => {
    expect(usesStorefrontInContext("cart")).toBe(false);
    expect(usesStorefrontInContext("cartLinesAdd")).toBe(false);
    expect(usesStorefrontInContext("products")).toBe(true);
  });
});
