import { describe, expect, it } from "vitest";
import { applyProductQuery, buildFacets, filterByCollection } from "@/lib/commerce/filters";
import { demoProducts } from "@/lib/commerce/demo/catalog";
import { parseProductQuery, queryToHref, serializeProductQuery } from "@/lib/commerce/url-state";

describe("applyProductQuery", () => {
  it("filters by species and category", () => {
    const result = applyProductQuery(demoProducts, {
      species: ["dog"],
      category: ["harnesses"],
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((product) => product.species === "dog")).toBe(true);
    expect(result.every((product) => product.category === "harnesses")).toBe(true);
  });

  it("sorts by price ascending", () => {
    const result = applyProductQuery(demoProducts, { sort: "price-asc" });
    const prices = result.map((product) => Number(product.priceRange.minVariantPrice.amount));
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
  });

  it("finds products by search term", () => {
    const result = applyProductQuery(demoProducts, { query: "sisal" });
    expect(result.some((product) => product.handle.includes("scratch"))).toBe(true);
  });
});

describe("filterByCollection", () => {
  it("returns cat products for the cats collection", () => {
    const cats = filterByCollection(demoProducts, "cats");
    expect(cats).not.toBeNull();
    expect(cats?.every((product) => product.species === "cat")).toBe(true);
  });

  it("returns null for an unknown handle", () => {
    expect(filterByCollection(demoProducts, "unknown")).toBeNull();
  });
});

describe("url state", () => {
  it("round-trips filter params", () => {
    const query = parseProductQuery({
      q: "wool",
      species: "dog,cat",
      sort: "price-desc",
      priceMin: "20",
    });
    const params = serializeProductQuery(query);

    expect(params.get("q")).toBe("wool");
    expect(params.get("species")).toBe("dog,cat");
    expect(params.get("sort")).toBe("price-desc");
    expect(params.get("priceMin")).toBe("20");
  });

  it("ignores unknown sort keys so URLs stay safe to share", () => {
    const query = parseProductQuery({ sort: "not-a-sort" });
    expect(query.sort).toBeUndefined();
    expect(serializeProductQuery(query).get("sort")).toBeNull();
  });

  it("refuses protocol-relative filter pathnames", () => {
    const href = queryToHref("//evil.example", { query: "oak" });
    expect(href.startsWith("//")).toBe(false);
    expect(href.startsWith("/")).toBe(true);
  });
});

describe("facets", () => {
  it("includes demo brands", () => {
    const facets = buildFacets(demoProducts);
    expect(facets.brands).toContain("Haven");
    expect(facets.priceMax).toBeGreaterThan(facets.priceMin);
  });
});
