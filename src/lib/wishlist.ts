import { isProductHandle } from "@/lib/security";
import type { Money, Product, ProductImage, ProductVisual } from "@/lib/commerce/types";
import type { ProductCategory, Species } from "@/lib/commerce/types";

export const WISHLIST_KEY = "paw_pine_wishlist";
export const WISHLIST_LIMIT = 50;

export interface WishlistItem {
  handle: string;
  title: string;
  vendor: string;
  species: Species;
  category: ProductCategory;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  image: ProductImage | null;
  visual: ProductVisual;
}

const EMPTY: WishlistItem[] = [];
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedItems: WishlistItem[] = EMPTY;

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeWishlist(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function toWishlistItem(product: Product): WishlistItem {
  return {
    handle: product.handle,
    title: product.title,
    vendor: product.vendor,
    species: product.species,
    category: product.category,
    availableForSale: product.availableForSale,
    price: product.priceRange.minVariantPrice,
    compareAtPrice: product.compareAtPriceRange.minVariantPrice,
    image: product.featuredImage,
    visual: product.visual,
  };
}

export function addWishlistItem(
  existing: WishlistItem[],
  item: WishlistItem,
  limit = WISHLIST_LIMIT,
): WishlistItem[] {
  if (!isProductHandle(item.handle)) {
    return existing;
  }
  if (existing.some((entry) => entry.handle === item.handle)) {
    return existing;
  }
  return [item, ...existing].slice(0, limit);
}

export function removeWishlistItem(
  existing: WishlistItem[],
  handle: string,
): WishlistItem[] {
  return existing.filter((entry) => entry.handle !== handle);
}

export function parseWishlist(raw: string | null | undefined): WishlistItem[] {
  if (!raw) {
    return EMPTY;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return EMPTY;
    }
    const items = parsed.filter(isWishlistItem).slice(0, WISHLIST_LIMIT);
    return items.length === 0 ? EMPTY : items;
  } catch {
    return EMPTY;
  }
}

export function getWishlistSnapshot(): WishlistItem[] {
  if (typeof window === "undefined") {
    return EMPTY;
  }
  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY);
    if (raw === cachedRaw) {
      return cachedItems;
    }
    cachedRaw = raw;
    cachedItems = parseWishlist(raw);
    return cachedItems;
  } catch {
    cachedItems = EMPTY;
    return cachedItems;
  }
}

export function isOnWishlist(handle: string, items = getWishlistSnapshot()): boolean {
  return items.some((item) => item.handle === handle);
}

export function saveToWishlist(product: Product | WishlistItem): WishlistItem[] {
  const item = "priceRange" in product ? toWishlistItem(product) : product;
  const next = addWishlistItem(getWishlistSnapshot(), item);
  persist(next);
  return next;
}

export function removeFromWishlist(handle: string): WishlistItem[] {
  const next = removeWishlistItem(getWishlistSnapshot(), handle);
  persist(next);
  return next;
}

function persist(items: WishlistItem[]): void {
  cachedItems = items;
  try {
    if (typeof window === "undefined") {
      return;
    }
    const serialized = JSON.stringify(items);
    window.localStorage.setItem(WISHLIST_KEY, serialized);
    cachedRaw = serialized;
  } catch {
    // Quota / private mode must not break browsing.
  }
  emit();
}

function isWishlistItem(value: unknown): value is WishlistItem {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.handle === "string" &&
    isProductHandle(record.handle) &&
    typeof record.title === "string" &&
    typeof record.vendor === "string" &&
    (record.species === "dog" || record.species === "cat") &&
    typeof record.category === "string" &&
    typeof record.availableForSale === "boolean" &&
    isMoney(record.price) &&
    isVisual(record.visual)
  );
}

function isMoney(value: unknown): value is Money {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.amount === "string" && typeof record.currencyCode === "string";
}

function isVisual(value: unknown): value is ProductVisual {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.background === "string" && typeof record.shape === "string";
}
