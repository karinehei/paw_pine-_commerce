import { describe, expect, it } from "vitest";
import { withLanguageInContext } from "@/lib/commerce/shopify/in-context";

describe("Shopify language context", () => {
  it("injects @inContext on queries with variables", () => {
    const next = withLanguageInContext(
      "query Products($query: String) { products { nodes { id } } }",
    );
    expect(next).toContain("$language: LanguageCode");
    expect(next).toContain("@inContext(language: $language)");
  });

  it("injects @inContext on queries without variables", () => {
    const next = withLanguageInContext(
      "query Collections { collections { nodes { id } } }",
    );
    expect(next).toContain(
      "query Collections($language: LanguageCode) @inContext(language: $language)",
    );
  });
});
