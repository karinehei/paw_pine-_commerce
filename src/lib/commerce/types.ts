export type Species = "dog" | "cat";

export type ProductCategory = "toys" | "harnesses" | "beds" | "feeding" | "scratching";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc";

export type AvailabilityFilter = "in-stock" | "out-of-stock";

export type ProductShape =
  | "ring"
  | "rope"
  | "harness"
  | "bed"
  | "raised-bed"
  | "bowl"
  | "slow-bowl"
  | "mice"
  | "wand"
  | "column"
  | "panel"
  | "perch"
  | "cave"
  | "dish"
  | "puzzle";

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ProductImage {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ProductVisual {
  background: string;
  accent: string;
  shape: ProductShape;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice: Money | null;
  image: ProductImage | null;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  featuredImage: ProductImage | null;
  images: ProductImage[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  compareAtPriceRange: {
    minVariantPrice: Money | null;
    maxVariantPrice: Money | null;
  };
  variants: ProductVariant[];
  options: ProductOption[];
  tags: string[];
  vendor: string;
  productType: string;
  species: Species;
  category: ProductCategory;
  material: string;
  features: string[];
  createdAt: string;
  visual: ProductVisual;
  sku: string;
  dimensions: string;
  care: string;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ProductImage | null;
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    selectedOptions: SelectedOption[];
    price: Money;
    image: ProductImage | null;
    product: {
      handle: string;
      title: string;
      visual: ProductVisual;
    };
  };
  cost: {
    totalAmount: Money;
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLine[];
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
}

export interface ProductQuery {
  query?: string;
  species?: Species[];
  category?: ProductCategory[];
  brand?: string[];
  material?: string[];
  availability?: AvailabilityFilter | "all";
  priceMin?: number;
  priceMax?: number;
  sort?: SortKey;
}

export interface Facets {
  species: Species[];
  categories: ProductCategory[];
  brands: string[];
  materials: string[];
  priceMin: number;
  priceMax: number;
}

export interface ProductConnection {
  products: Product[];
  facets: Facets;
}

export interface CollectionResult {
  collection: Collection;
  products: Product[];
  facets: Facets;
}

export interface CartLineInput {
  variantId: string;
  quantity: number;
}

export interface CommerceProvider {
  getProducts(query?: ProductQuery): Promise<ProductConnection>;
  getProduct(handle: string): Promise<Product | null>;
  getCollections(): Promise<Collection[]>;
  getCollection(handle: string, query?: ProductQuery): Promise<CollectionResult | null>;
  searchProducts(query: string, filters?: ProductQuery): Promise<ProductConnection>;
  getCart(cartId: string): Promise<Cart | null>;
  createCart(lines?: CartLineInput[]): Promise<Cart>;
  addToCart(cartId: string, variantId: string, quantity: number): Promise<Cart>;
  updateCart(cartId: string, lineId: string, quantity: number): Promise<Cart>;
  removeFromCart(cartId: string, lineId: string): Promise<Cart>;
  getRecommendations(handle: string): Promise<Product[]>;
}

export type CommerceMode = "shopify" | "demo";
