import { CommerceError } from "@/lib/commerce/errors";
import {
  applyProductQuery,
  buildFacets,
  filterByCollection,
} from "@/lib/commerce/filters";
import { getRelatedProducts } from "@/lib/commerce/related";
import { shopifyFetch } from "@/lib/commerce/shopify/client";
import { collectionOverlayFromHandle } from "@/lib/commerce/shopify/collection-overlay";
import {
  filterPawPineCollections,
  filterPawPineProducts,
  isPawPineCollectionHandle,
  isPawPineProduct,
  shopifyCatalogQueryClause,
} from "@/lib/commerce/catalog-scope";
import {
  localizeCollection,
  localizeProduct,
  localizeProducts,
} from "@/lib/commerce/demo/localize";
import { getLocale } from "@/lib/i18n/locale";
import {
  buildShopifySearchQuery,
  mapCart,
  mapCollection,
  mapProduct,
  toShopifyCollectionSort,
  toShopifyProductSort,
} from "@/lib/commerce/shopify/mapper";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  COLLECTIONS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_QUERY,
  SEARCH_QUERY,
} from "@/lib/commerce/shopify/queries";
import type {
  ShopifyCartNode,
  ShopifyCollectionNode,
  ShopifyProductNode,
  ShopifyUserErrorPayload,
} from "@/lib/commerce/shopify/storefront-types";
import type {
  Cart,
  CartLineInput,
  CollectionResult,
  CommerceProvider,
  ProductConnection,
  ProductQuery,
} from "@/lib/commerce/types";

function unwrapCart(payload: ShopifyUserErrorPayload | null | undefined): Cart {
  if (payload?.userErrors?.length) {
    const first = payload.userErrors[0];
    const message = first?.message ?? "";
    const code = first?.code?.toLowerCase() ?? "";
    const lower = message.toLowerCase();
    if (
      code.includes("stock") ||
      code.includes("inventory") ||
      lower.includes("stock") ||
      lower.includes("inventory")
    ) {
      throw new CommerceError("out_of_stock");
    }
    if (
      code.includes("not_found") ||
      lower.includes("not found") ||
      lower.includes("does not exist") ||
      lower.includes("expired")
    ) {
      throw new CommerceError("invalid_cart");
    }
    throw new CommerceError("invalid_cart");
  }
  if (!payload?.cart) {
    throw new CommerceError("invalid_cart");
  }
  return mapCart(payload.cart);
}

function connect(
  products: ReturnType<typeof mapProduct>[],
  source = products,
): ProductConnection {
  return {
    products,
    facets: buildFacets(source.length > 0 ? source : products),
  };
}

export const shopifyProvider: CommerceProvider = {
  async getProducts(query: ProductQuery = {}): Promise<ProductConnection> {
    const { sortKey, reverse } = toShopifyProductSort(query.sort);
    const data = await shopifyFetch<{ products: { nodes: ShopifyProductNode[] } }>({
      query: PRODUCTS_QUERY,
      operation: "products",
      variables: {
        query: buildShopifySearchQuery(query),
        sortKey,
        reverse,
      },
    });
    const mapped = filterPawPineProducts(data.products.nodes.map(mapProduct));
    const locale = await getLocale();
    const localised = localizeProducts(mapped, locale);
    return connect(applyProductQuery(localised, query), localised);
  },

  async getProduct(handle: string) {
    const data = await shopifyFetch<{ product: ShopifyProductNode | null }>({
      query: PRODUCT_BY_HANDLE_QUERY,
      operation: "productByHandle",
      variables: { handle },
    });
    const mapped = data.product ? mapProduct(data.product) : null;
    if (!mapped || !isPawPineProduct(mapped)) {
      return null;
    }
    return localizeProduct(mapped, await getLocale());
  },

  async getCollections() {
    const locale = await getLocale();
    const data = await shopifyFetch<{
      collections: { nodes: ShopifyCollectionNode[] };
    }>({ query: COLLECTIONS_QUERY, operation: "collections" });
    return filterPawPineCollections(data.collections.nodes.map(mapCollection)).map(
      (collection) => localizeCollection(collection, locale),
    );
  },

  async getCollection(
    handle: string,
    query: ProductQuery = {},
  ): Promise<CollectionResult | null> {
    const { sortKey, reverse } = toShopifyCollectionSort(query.sort);
    const data = await shopifyFetch<{ collection: ShopifyCollectionNode | null }>({
      query: COLLECTION_BY_HANDLE_QUERY,
      operation: "collectionByHandle",
      variables: { handle, sortKey, reverse },
    });

    if (data.collection && isPawPineCollectionHandle(handle)) {
      const locale = await getLocale();
      const mapped = filterPawPineProducts(
        (data.collection.products?.nodes ?? []).map(mapProduct),
      );
      const localised = localizeProducts(mapped, locale);
      return {
        collection: localizeCollection(mapCollection(data.collection), locale),
        products: applyProductQuery(localised, query),
        facets: buildFacets(localised),
      };
    }

    const { products } = await this.getProducts();
    const scoped = filterByCollection(products, handle);
    if (!scoped) {
      return null;
    }

    return {
      collection: collectionOverlayFromHandle(handle),
      products: applyProductQuery(scoped, query),
      facets: buildFacets(scoped),
    };
  },

  async searchProducts(query: string, filters: ProductQuery = {}) {
    const data = await shopifyFetch<{
      search: { nodes: Array<ShopifyProductNode | Record<string, never>> };
    }>({
      query: SEARCH_QUERY,
      operation: "searchProducts",
      variables: { query: `${shopifyCatalogQueryClause()} ${query}`.trim() },
      revalidate: 30,
    });
    const mapped = filterPawPineProducts(
      data.search.nodes
        .filter(
          (node): node is ShopifyProductNode => "handle" in node && Boolean(node.handle),
        )
        .map(mapProduct),
    );
    const locale = await getLocale();
    const localised = localizeProducts(mapped, locale);
    return connect(applyProductQuery(localised, { ...filters, query }), localised);
  },

  async getCart(cartId: string) {
    const data = await shopifyFetch<{ cart: ShopifyCartNode | null }>({
      query: CART_QUERY,
      operation: "cart",
      variables: { id: cartId },
      cache: "no-store",
    });
    return data.cart ? mapCart(data.cart) : null;
  },

  async createCart(lines: CartLineInput[] = []) {
    const data = await shopifyFetch<{ cartCreate: ShopifyUserErrorPayload }>({
      query: CART_CREATE_MUTATION,
      operation: "cartCreate",
      variables: {
        lines: lines.map((line) => ({
          merchandiseId: line.variantId,
          quantity: line.quantity,
        })),
      },
      cache: "no-store",
    });
    return unwrapCart(data.cartCreate);
  },

  async addToCart(cartId: string, variantId: string, quantity: number) {
    const data = await shopifyFetch<{ cartLinesAdd: ShopifyUserErrorPayload }>({
      query: CART_LINES_ADD_MUTATION,
      operation: "cartLinesAdd",
      variables: {
        cartId,
        lines: [{ merchandiseId: variantId, quantity }],
      },
      cache: "no-store",
    });
    return unwrapCart(data.cartLinesAdd);
  },

  async updateCart(cartId: string, lineId: string, quantity: number) {
    const data = await shopifyFetch<{ cartLinesUpdate: ShopifyUserErrorPayload }>({
      query: CART_LINES_UPDATE_MUTATION,
      operation: "cartLinesUpdate",
      variables: {
        cartId,
        lines: [{ id: lineId, quantity }],
      },
      cache: "no-store",
    });
    return unwrapCart(data.cartLinesUpdate);
  },

  async removeFromCart(cartId: string, lineId: string) {
    const data = await shopifyFetch<{ cartLinesRemove: ShopifyUserErrorPayload }>({
      query: CART_LINES_REMOVE_MUTATION,
      operation: "cartLinesRemove",
      variables: { cartId, lineIds: [lineId] },
      cache: "no-store",
    });
    return unwrapCart(data.cartLinesRemove);
  },

  async getRecommendations(handle: string) {
    const [product, listing] = await Promise.all([
      this.getProduct(handle),
      this.getProducts(),
    ]);
    if (!product) {
      return [];
    }
    return getRelatedProducts(product, listing.products, 4);
  },
};
