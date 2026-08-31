export const PAW_PINE_CATALOG_TAG = "catalog:paw-pine";
export const PAW_PINE_CATALOG_TAG_LEGACY = "paw-pine";

export const PAW_PINE_COLLECTION_HANDLES = [
  "all",
  "dogs",
  "cats",
  "toys",
  "harnesses",
  "beds",
  "feeding",
  "scratching",
  "new-arrivals",
  "best-sellers",
] as const;

const SAMPLE_HANDLE_PATTERN = /(snowboard|ski-wax|^gift-card$|selling-plans)/i;

export function isPawPineCollectionHandle(handle: string): boolean {
  return (PAW_PINE_COLLECTION_HANDLES as readonly string[]).includes(handle);
}

export function isShopifySampleHandle(handle: string): boolean {
  return SAMPLE_HANDLE_PATTERN.test(handle.trim());
}

export function hasPawPineCatalogTag(tags: string[] | undefined): boolean {
  const lowered = (tags ?? []).map((tag) => tag.toLowerCase());
  return (
    lowered.includes(PAW_PINE_CATALOG_TAG) ||
    lowered.includes(PAW_PINE_CATALOG_TAG_LEGACY)
  );
}

export function isPawPineProduct(product: { handle: string; tags?: string[] }): boolean {
  if (isShopifySampleHandle(product.handle)) {
    return false;
  }
  return hasPawPineCatalogTag(product.tags);
}

export function filterPawPineProducts<T extends { handle: string; tags?: string[] }>(
  products: T[],
): T[] {
  return products.filter(isPawPineProduct);
}

export function filterPawPineCollections<T extends { handle: string }>(
  collections: T[],
): T[] {
  return collections.filter((collection) => isPawPineCollectionHandle(collection.handle));
}

/** Storefront `products(query:)` clause. Never identify the catalogue by vendor. */
export function shopifyCatalogQueryClause(): string {
  return `(tag:${PAW_PINE_CATALOG_TAG} OR tag:${PAW_PINE_CATALOG_TAG_LEGACY})`;
}
