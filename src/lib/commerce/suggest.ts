import { applyProductQuery } from "@/lib/commerce/filters";
import type { Collection, Product } from "@/lib/commerce/types";

export interface ProductSuggestion {
  handle: string;
  title: string;
  vendor: string;
}

export interface CollectionSuggestion {
  handle: string;
  title: string;
}

export interface SearchSuggestions {
  products: ProductSuggestion[];
  collections: CollectionSuggestion[];
}

export function buildSuggestions(
  query: string,
  products: Product[],
  collections: Collection[],
  limit = 6,
): SearchSuggestions {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) {
    return { products: [], collections: [] };
  }

  const matchedProducts = applyProductQuery(products, { query: needle })
    .slice(0, limit)
    .map((product) => ({
      handle: product.handle,
      title: product.title,
      vendor: product.vendor,
    }));

  const matchedCollections = collections
    .filter((collection) => {
      const haystack =
        `${collection.title} ${collection.handle} ${collection.description}`.toLowerCase();
      return haystack.includes(needle);
    })
    .slice(0, 4)
    .map((collection) => ({
      handle: collection.handle,
      title: collection.title,
    }));

  return {
    products: matchedProducts,
    collections: matchedCollections,
  };
}
