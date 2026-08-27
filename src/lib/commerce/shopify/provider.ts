import { CommerceError } from "@/lib/commerce/errors";
import { applyProductQuery, buildFacets, filterByCollection } from "@/lib/commerce/filters";
import { shopifyFetch } from "@/lib/commerce/shopify/client";
import { demoCollections } from "@/lib/commerce/demo/catalog";
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
    const message = payload.userErrors[0]?.message ?? "";
    const lower = message.toLowerCase();
    if (lower.includes("stock")) {
      throw new CommerceError("out_of_stock");
    }
    if (lower.includes("not found") || lower.includes("does not exist") || lower.includes("expired")) {
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
      variables: {
        query: buildShopifySearchQuery(query),
        sortKey,
        reverse,
      },
    });
    const mapped = data.products.nodes.map(mapProduct);
    return connect(applyProductQuery(mapped, query), mapped);
  },

  async getProduct(handle: string) {
    const data = await shopifyFetch<{ product: ShopifyProductNode | null }>({
      query: PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
    });
    return data.product ? mapProduct(data.product) : null;
  },

  async getCollections() {
    const data = await shopifyFetch<{
      collections: { nodes: ShopifyCollectionNode[] };
    }>({ query: COLLECTIONS_QUERY });
    return data.collections.nodes.map(mapCollection);
  },

  async getCollection(
    handle: string,
    query: ProductQuery = {},
  ): Promise<CollectionResult | null> {
    const { sortKey, reverse } = toShopifyCollectionSort(query.sort);
    try {
      const data = await shopifyFetch<{ collection: ShopifyCollectionNode | null }>({
        query: COLLECTION_BY_HANDLE_QUERY,
        variables: { handle, sortKey, reverse },
      });

      if (data.collection) {
        const mapped = (data.collection.products?.nodes ?? []).map(mapProduct);
        return {
          collection: mapCollection(data.collection),
          products: applyProductQuery(mapped, query),
          facets: buildFacets(mapped),
        };
      }
    } catch {
      // Unknown handles and empty shops fall through to tag-based collections.
    }

    const { products } = await this.getProducts();
    const scoped = filterByCollection(products, handle);
    const meta = demoCollections.find((item) => item.handle === handle);
    if (!scoped || !meta) {
      return null;
    }

    return {
      collection: meta,
      products: applyProductQuery(scoped, query),
      facets: buildFacets(scoped),
    };
  },

  async searchProducts(query: string, filters: ProductQuery = {}) {
    const data = await shopifyFetch<{
      search: { nodes: Array<ShopifyProductNode | Record<string, never>> };
    }>({
      query: SEARCH_QUERY,
      variables: { query },
      revalidate: 30,
    });
    const mapped = data.search.nodes
      .filter((node): node is ShopifyProductNode => "handle" in node && Boolean(node.handle))
      .map(mapProduct);
    return connect(applyProductQuery(mapped, { ...filters, query }), mapped);
  },

  async getCart(cartId: string) {
    const data = await shopifyFetch<{ cart: ShopifyCartNode | null }>({
      query: CART_QUERY,
      variables: { id: cartId },
      cache: "no-store",
    });
    return data.cart ? mapCart(data.cart) : null;
  },

  async createCart(lines: CartLineInput[] = []) {
    const data = await shopifyFetch<{ cartCreate: ShopifyUserErrorPayload }>({
      query: CART_CREATE_MUTATION,
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
      variables: { cartId, lineIds: [lineId] },
      cache: "no-store",
    });
    return unwrapCart(data.cartLinesRemove);
  },

  async getRecommendations(handle: string) {
    const product = await this.getProduct(handle);
    const { products } = await this.getProducts({
      species: product ? [product.species] : undefined,
    });
    return products.filter((item) => item.handle !== handle).slice(0, 4);
  },
};
