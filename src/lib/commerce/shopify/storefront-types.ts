export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface ShopifyVariantNode {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  selectedOptions: Array<{ name: string; value: string }>;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  image?: ShopifyImage | null;
  product?: { handle: string; title: string };
}

export interface ShopifyProductNode {
  id: string;
  handle: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  vendor: string;
  productType: string;
  tags: string[];
  createdAt: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images?: { nodes: ShopifyImage[] };
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  compareAtPriceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  options?: Array<{ id: string; name: string; values: string[] }>;
  variants?: { nodes: ShopifyVariantNode[] };
}

export interface ShopifyCollectionNode {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  products?: { nodes: ShopifyProductNode[] };
}

export interface ShopifyCartNode {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
  };
  lines: {
    nodes: Array<{
      id: string;
      quantity: number;
      cost: {
        totalAmount: ShopifyMoney;
        amountPerQuantity?: ShopifyMoney | null;
      };
      merchandise: ShopifyVariantNode;
    }>;
  };
}

export interface ShopifyUserErrorPayload {
  userErrors?: Array<{ message: string; code?: string }>;
  warnings?: Array<{ message: string; code?: string; target?: string }>;
  cart?: ShopifyCartNode | null;
}
