import { parseAmount } from "@/lib/format";
import type {
  Facets,
  Product,
  ProductCategory,
  ProductQuery,
  Species,
} from "@/lib/commerce/types";

export function applyProductQuery(
  products: Product[],
  query: ProductQuery = {},
): Product[] {
  let result = products;

  if (query.query) {
    const needle = query.query.toLowerCase();
    result = result.filter((product) => {
      const haystack = [
        product.title,
        product.description,
        product.vendor,
        product.material,
        product.productType,
        ...product.tags,
        ...product.features,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }

  if (query.species?.length) {
    result = result.filter((product) => query.species?.includes(product.species));
  }

  if (query.category?.length) {
    result = result.filter((product) => query.category?.includes(product.category));
  }

  if (query.brand?.length) {
    const brands = new Set(query.brand.map((brand) => brand.toLowerCase()));
    result = result.filter((product) => brands.has(product.vendor.toLowerCase()));
  }

  if (query.material?.length) {
    const materials = new Set(query.material.map((material) => material.toLowerCase()));
    result = result.filter((product) => materials.has(product.material.toLowerCase()));
  }

  if (query.availability === "in-stock") {
    result = result.filter((product) => product.availableForSale);
  }

  if (query.availability === "out-of-stock") {
    result = result.filter((product) => !product.availableForSale);
  }

  if (query.priceMin !== undefined) {
    result = result.filter(
      (product) =>
        parseAmount(product.priceRange.minVariantPrice) >= (query.priceMin ?? 0),
    );
  }

  if (query.priceMax !== undefined) {
    result = result.filter(
      (product) =>
        parseAmount(product.priceRange.minVariantPrice) <= (query.priceMax ?? 0),
    );
  }

  return sortProducts(result, query.sort ?? "featured");
}

export function sortProducts(
  products: Product[],
  sort: ProductQuery["sort"] = "featured",
): Product[] {
  const copy = [...products];

  switch (sort) {
    case "newest":
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "price-asc":
      return copy.sort(
        (a, b) =>
          parseAmount(a.priceRange.minVariantPrice) -
          parseAmount(b.priceRange.minVariantPrice),
      );
    case "price-desc":
      return copy.sort(
        (a, b) =>
          parseAmount(b.priceRange.minVariantPrice) -
          parseAmount(a.priceRange.minVariantPrice),
      );
    case "featured":
    default:
      return copy.sort((a, b) => {
        const aFeatured = a.tags.includes("bestseller") ? 1 : 0;
        const bFeatured = b.tags.includes("bestseller") ? 1 : 0;
        if (aFeatured !== bFeatured) {
          return bFeatured - aFeatured;
        }
        return a.title.localeCompare(b.title);
      });
  }
}

export function buildFacets(products: Product[]): Facets {
  const prices = products.map((product) =>
    parseAmount(product.priceRange.minVariantPrice),
  );

  return {
    species: uniqueSorted(products.map((product) => product.species)) as Species[],
    categories: uniqueSorted(
      products.map((product) => product.category),
    ) as ProductCategory[],
    brands: uniqueSorted(products.map((product) => product.vendor)),
    materials: uniqueSorted(products.map((product) => product.material)),
    priceMin: prices.length > 0 ? Math.floor(Math.min(...prices)) : 0,
    priceMax: prices.length > 0 ? Math.ceil(Math.max(...prices)) : 0,
  };
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function filterByCollection(
  products: Product[],
  handle: string,
): Product[] | null {
  switch (handle) {
    case "all":
      return products;
    case "dogs":
      return products.filter((product) => product.species === "dog");
    case "cats":
      return products.filter((product) => product.species === "cat");
    case "toys":
    case "harnesses":
    case "beds":
    case "feeding":
    case "scratching":
      return products.filter((product) => product.category === handle);
    case "new-arrivals":
      return products.filter((product) => product.tags.includes("new"));
    case "best-sellers":
      return products.filter((product) => product.tags.includes("bestseller"));
    default:
      return null;
  }
}
