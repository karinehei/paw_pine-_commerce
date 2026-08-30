import { describe, expect, it } from "vitest";
import { demoProducts } from "@/lib/commerce/demo/catalog";
import {
  addWishlistItem,
  parseWishlist,
  removeWishlistItem,
  toWishlistItem,
  WISHLIST_LIMIT,
  type WishlistItem,
} from "@/lib/wishlist";

function oakwood() {
  const product = demoProducts.find((item) => item.handle === "oakwood-chew-ring");
  expect(product).toBeDefined();
  return toWishlistItem(product!);
}

function harness() {
  const product = demoProducts.find((item) => item.handle === "trail-harness");
  expect(product).toBeDefined();
  return toWishlistItem(product!);
}

describe("wishlist", () => {
  it("adds and removes a product without duplicates", () => {
    const first = addWishlistItem([], oakwood());
    expect(first).toHaveLength(1);
    expect(first[0]?.handle).toBe("oakwood-chew-ring");

    expect(addWishlistItem(first, oakwood())).toHaveLength(1);

    const two = addWishlistItem(first, harness());
    expect(two.map((item) => item.handle)).toEqual([
      "trail-harness",
      "oakwood-chew-ring",
    ]);

    expect(removeWishlistItem(two, "trail-harness").map((item) => item.handle)).toEqual([
      "oakwood-chew-ring",
    ]);
  });

  it("round-trips through storage JSON", () => {
    const saved = addWishlistItem([], oakwood());
    expect(parseWishlist(JSON.stringify(saved))).toEqual(saved);
    expect(parseWishlist("{")).toEqual([]);
    expect(parseWishlist(null)).toEqual([]);
  });

  it("ignores unsafe handles and caps length", () => {
    expect(addWishlistItem([], { ...oakwood(), handle: "../etc" })).toHaveLength(0);

    let items: WishlistItem[] = [];
    for (let index = 0; index < WISHLIST_LIMIT + 5; index += 1) {
      items = addWishlistItem(items, { ...oakwood(), handle: `piece-${index}` });
    }
    expect(items).toHaveLength(WISHLIST_LIMIT);
    expect(items[0]?.handle).toBe(`piece-${WISHLIST_LIMIT + 4}`);
  });
});
