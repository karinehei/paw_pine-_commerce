import { isProductHandle } from "@/lib/security";

export interface RecentProduct {
  handle: string;
  title: string;
  vendor: string;
}

export const RECENT_KEY = "paw_pine_recently_viewed";
const LIMIT = 8;
const EMPTY: RecentProduct[] = [];

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedItems: RecentProduct[] = EMPTY;
let exceptKey = "";
let exceptItems: RecentProduct[] = EMPTY;

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeRecentlyViewed(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRecentlyViewedSnapshot(): RecentProduct[] {
  if (typeof window === "undefined") {
    return EMPTY;
  }

  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (raw === cachedRaw) {
      return cachedItems;
    }
    cachedRaw = raw;
    if (!raw) {
      cachedItems = EMPTY;
      return cachedItems;
    }
    const parsed: unknown = JSON.parse(raw);
    cachedItems = Array.isArray(parsed)
      ? parsed.filter(isRecentProduct).slice(0, LIMIT)
      : EMPTY;
    return cachedItems;
  } catch {
    cachedItems = EMPTY;
    return cachedItems;
  }
}

export function getRecentlyViewedExcept(handle: string): RecentProduct[] {
  const all = getRecentlyViewedSnapshot();
  const key = `${cachedRaw ?? ""}::${handle}`;
  if (key === exceptKey) {
    return exceptItems;
  }
  exceptKey = key;
  exceptItems = all.filter((item) => item.handle !== handle);
  return exceptItems;
}

export function readRecentlyViewed(): RecentProduct[] {
  return getRecentlyViewedSnapshot();
}

export const RECENT_LIMIT = LIMIT;

export function pushRecentlyViewed(
  product: RecentProduct,
  existing: RecentProduct[],
  limit = LIMIT,
): RecentProduct[] {
  if (!isProductHandle(product.handle)) {
    return existing.slice(0, limit);
  }
  return [product, ...existing.filter((item) => item.handle !== product.handle)].slice(
    0,
    limit,
  );
}

export function rememberProduct(product: RecentProduct): RecentProduct[] {
  const next = pushRecentlyViewed(product, getRecentlyViewedSnapshot());

  try {
    const serialized = JSON.stringify(next);
    window.localStorage.setItem(RECENT_KEY, serialized);
    cachedRaw = serialized;
    cachedItems = next;
    exceptKey = "";
    emit();
  } catch {
    // Ignore quota / private mode.
  }

  return next;
}

function isRecentProduct(value: unknown): value is RecentProduct {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.handle === "string" &&
    isProductHandle(record.handle) &&
    typeof record.title === "string" &&
    typeof record.vendor === "string"
  );
}
