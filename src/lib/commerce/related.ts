import { parseAmount } from "@/lib/format";
import { isPawPineProduct } from "@/lib/commerce/catalog-scope";
import type { Product } from "@/lib/commerce/types";

const SPECIES_TAGS = new Set(["dog", "cat"]);

/**
 * Deterministic related ranking. Weights, in order of importance:
 * same category, shared merchandising collections (new / bestseller),
 * overlapping tags, nearby price. Different species are excluded.
 */
export const RELATED_WEIGHTS = {
  category: 40,
  collection: 15,
  sharedTag: 8,
  closePrice: 12,
  similarPrice: 6,
} as const;

export function getRelatedProducts(
  current: Product,
  catalogue: Product[],
  limit = 4,
): Product[] {
  return catalogue
    .filter((product) => isRelevantRelated(current, product))
    .map((product) => ({
      product,
      score: scoreRelatedProduct(current, product),
    }))
    .sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      return a.product.handle.localeCompare(b.product.handle);
    })
    .slice(0, limit)
    .map((entry) => entry.product);
}

export function isRelevantRelated(current: Product, candidate: Product): boolean {
  if (candidate.handle === current.handle) {
    return false;
  }
  if (!isPawPineProduct(candidate)) {
    return false;
  }
  return candidate.species === current.species;
}

export function scoreRelatedProduct(current: Product, candidate: Product): number {
  let score = 0;
  if (candidate.category === current.category) {
    score += RELATED_WEIGHTS.category;
  }

  const currentCollections = merchandisingCollections(current);
  const sharedCollections = merchandisingCollections(candidate).filter((id) =>
    currentCollections.includes(id),
  );
  if (sharedCollections.length > 0) {
    score += RELATED_WEIGHTS.collection * sharedCollections.length;
  }

  const currentTags = merchandisingTags(current.tags);
  const sharedTags = merchandisingTags(candidate.tags).filter((tag) =>
    currentTags.includes(tag),
  );
  score += RELATED_WEIGHTS.sharedTag * sharedTags.length;

  const currentPrice = parseAmount(current.priceRange.minVariantPrice);
  const candidatePrice = parseAmount(candidate.priceRange.minVariantPrice);
  if (currentPrice > 0 && candidatePrice > 0) {
    const delta = Math.abs(candidatePrice - currentPrice) / currentPrice;
    if (delta <= 0.35) {
      score += RELATED_WEIGHTS.closePrice;
    } else if (delta <= 0.7) {
      score += RELATED_WEIGHTS.similarPrice;
    }
  }

  return score;
}

function merchandisingTags(tags: string[]): string[] {
  return tags.filter((tag) => !SPECIES_TAGS.has(tag.toLowerCase()));
}

function merchandisingCollections(product: Product): string[] {
  const handles: string[] = [product.category];
  if (product.tags.includes("new")) {
    handles.push("new-arrivals");
  }
  if (product.tags.includes("bestseller")) {
    handles.push("best-sellers");
  }
  return handles;
}
