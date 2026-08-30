import { describe, expect, it } from "vitest";
import {
  pushRecentlyViewed,
  RECENT_LIMIT,
  type RecentProduct,
} from "@/lib/recently-viewed";

const oak: RecentProduct = {
  handle: "oakwood-chew-ring",
  title: "Oakwood Chew Ring",
  vendor: "Pinecraft",
};
const harness: RecentProduct = {
  handle: "trail-harness",
  title: "Trail Harness",
  vendor: "Northline",
};
const rope: RecentProduct = {
  handle: "canvas-tug-rope",
  title: "Canvas Tug Rope",
  vendor: "Fjord",
};

describe("recently viewed", () => {
  it("keeps newest first and deduplicates", () => {
    const first = pushRecentlyViewed(oak, []);
    const second = pushRecentlyViewed(harness, first);
    expect(second.map((item) => item.handle)).toEqual([
      "trail-harness",
      "oakwood-chew-ring",
    ]);

    const again = pushRecentlyViewed(oak, second);
    expect(again.map((item) => item.handle)).toEqual([
      "oakwood-chew-ring",
      "trail-harness",
    ]);
  });

  it("caps at eight items", () => {
    let items: RecentProduct[] = [];
    for (let index = 0; index < RECENT_LIMIT + 3; index += 1) {
      items = pushRecentlyViewed(
        { handle: `piece-${index}`, title: `Piece ${index}`, vendor: "House" },
        items,
      );
    }
    expect(items).toHaveLength(RECENT_LIMIT);
    expect(items[0]?.handle).toBe(`piece-${RECENT_LIMIT + 2}`);
    expect(items.at(-1)?.handle).toBe("piece-3");
  });

  it("ignores unsafe handles", () => {
    expect(
      pushRecentlyViewed({ handle: "not a handle", title: "X", vendor: "Y" }, [rope]),
    ).toEqual([rope]);
  });
});
