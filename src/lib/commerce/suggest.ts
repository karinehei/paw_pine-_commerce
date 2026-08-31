import { applyProductQuery } from "@/lib/commerce/filters";
import {
  filterPawPineCollections,
  filterPawPineProducts,
} from "@/lib/commerce/catalog-scope";
import type { Collection, Money, Product } from "@/lib/commerce/types";

export interface ProductSuggestion {
  handle: string;
  title: string;
  vendor: string;
  category?: string;
  price?: Money;
  image?: { url: string; altText: string } | null;
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

  const catalogue = filterPawPineProducts(products);
  const matchedProducts = applyProductQuery(catalogue, { query: needle })
    .slice(0, limit)
    .map((product) => ({
      handle: product.handle,
      title: product.title,
      vendor: product.vendor,
      category: product.category,
      price: product.priceRange.minVariantPrice,
      image: product.featuredImage
        ? { url: product.featuredImage.url, altText: product.featuredImage.altText }
        : null,
    }));

  const matchedCollections = filterPawPineCollections(collections)
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
