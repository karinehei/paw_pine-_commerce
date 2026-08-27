import {
  applyProductQuery,
  buildFacets,
  filterByCollection,
} from "@/lib/commerce/filters";
import {
  demoCollections,
  demoProducts,
  findDemoProduct,
} from "@/lib/commerce/demo/catalog";
import type {
  CollectionResult,
  ProductConnection,
  ProductQuery,
} from "@/lib/commerce/types";

export const demoCatalogApi = {
  async getProducts(query: ProductQuery = {}): Promise<ProductConnection> {
    const products = applyProductQuery(demoProducts, query);
    return {
      products,
      facets: buildFacets(demoProducts),
    };
  },

  async getProduct(handle: string) {
    return findDemoProduct(handle) ?? null;
  },

  async getCollections() {
    return demoCollections;
  },

  async getCollection(
    handle: string,
    query: ProductQuery = {},
  ): Promise<CollectionResult | null> {
    const collection = demoCollections.find((item) => item.handle === handle);
    const scoped = filterByCollection(demoProducts, handle);
    if (!collection || !scoped) {
      return null;
    }

    return {
      collection,
      products: applyProductQuery(scoped, query),
      facets: buildFacets(scoped),
    };
  },

  async searchProducts(query: string, filters: ProductQuery = {}) {
    const products = applyProductQuery(demoProducts, { ...filters, query });
    return {
      products,
      facets: buildFacets(demoProducts),
    };
  },

  async getRecommendations(handle: string) {
    const product = findDemoProduct(handle);
    if (!product) {
      return demoProducts.slice(0, 4);
    }

    return demoProducts
      .filter((item) => item.handle !== handle && item.species === product.species)
      .slice(0, 4);
  },
};
