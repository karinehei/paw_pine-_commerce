import type { Collection } from "@/lib/commerce/types";

const TITLES: Record<string, string> = {
  all: "All products",
  dogs: "Dogs",
  cats: "Cats",
  toys: "Toys",
  harnesses: "Harnesses",
  beds: "Beds",
  feeding: "Feeding",
  scratching: "Scratching",
  "new-arrivals": "New arrivals",
  "best-sellers": "Best sellers",
};

/** Collection overlay when Shopify has no matching handle. Uses live products only. */
export function collectionOverlayFromHandle(handle: string): Collection {
  const title =
    TITLES[handle] ?? handle.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    id: `gid://shopify/Collection/overlay-${handle}`,
    handle,
    title,
    description: "",
    image: null,
  };
}
