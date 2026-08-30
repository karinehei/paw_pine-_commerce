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
import {
  localizeCollection,
  localizeProduct,
  localizeProducts,
} from "@/lib/commerce/demo/localize";
import { getRelatedProducts } from "@/lib/commerce/related";
import { getLocale } from "@/lib/i18n/locale";
import type {
  CollectionResult,
  ProductConnection,
  ProductQuery,
} from "@/lib/commerce/types";

export const demoCatalogApi = {
  async getProducts(query: ProductQuery = {}): Promise<ProductConnection> {
    const locale = await getLocale();
    const catalogue = localizeProducts(demoProducts, locale);
    const products = applyProductQuery(catalogue, query);
    return {
      products,
      facets: buildFacets(catalogue),
    };
  },

  async getProduct(handle: string) {
    const locale = await getLocale();
    const product = findDemoProduct(handle);
    return product ? localizeProduct(product, locale) : null;
  },

  async getCollections() {
    const locale = await getLocale();
    return demoCollections.map((collection) => localizeCollection(collection, locale));
  },

  async getCollection(
    handle: string,
    query: ProductQuery = {},
  ): Promise<CollectionResult | null> {
    const locale = await getLocale();
    const collection = demoCollections.find((item) => item.handle === handle);
    const scoped = filterByCollection(demoProducts, handle);
    if (!collection || !scoped) {
      return null;
    }
    const products = localizeProducts(scoped, locale);

    return {
      collection: localizeCollection(collection, locale),
      products: applyProductQuery(products, query),
      facets: buildFacets(products),
    };
  },

  async searchProducts(query: string, filters: ProductQuery = {}) {
    const locale = await getLocale();
    const catalogue = localizeProducts(demoProducts, locale);
    const products = applyProductQuery(catalogue, { ...filters, query });
    return {
      products,
      facets: buildFacets(catalogue),
    };
  },

  async getRecommendations(handle: string) {
    const locale = await getLocale();
    const product = findDemoProduct(handle);
    const catalogue = localizeProducts(demoProducts, locale);
    if (!product) {
      return catalogue.slice(0, 4);
    }
    return getRelatedProducts(localizeProduct(product, locale), catalogue, 4);
  },
};
