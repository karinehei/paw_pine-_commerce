"use client";

import { useSyncExternalStore } from "react";
import { track } from "@/lib/analytics/events";
import { itemFromWishlist } from "@/lib/analytics/items";
import { useMessages } from "@/components/i18n/LocaleProvider";
import {
  getWishlistSnapshot,
  isOnWishlist,
  removeFromWishlist,
  saveToWishlist,
  subscribeWishlist,
  toWishlistItem,
  type WishlistItem,
} from "@/lib/wishlist";
import type { Product } from "@/lib/commerce/types";

function subscribeNever() {
  return () => undefined;
}

export function WishlistButton({
  product,
  compact = false,
}: {
  product: Product | WishlistItem;
  compact?: boolean;
}) {
  const t = useMessages();
  const item = "priceRange" in product ? toWishlistItem(product) : product;
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const saved = useSyncExternalStore(
    subscribeWishlist,
    () => isOnWishlist(item.handle, getWishlistSnapshot()),
    () => false,
  );

  function onClick() {
    if (saved) {
      removeFromWishlist(item.handle);
      track({ name: "wishlist_remove", items: [itemFromWishlist(item)] });
      return;
    }
    saveToWishlist(item);
    track({ name: "wishlist_add", items: [itemFromWishlist(item)] });
  }

  const label = saved ? t.removeFromWishlist(item.title) : t.saveToWishlist(item.title);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={hydrated ? saved : false}
      aria-label={label}
      className={`min-h-11 text-xs tracking-[0.12em] uppercase ${
        compact
          ? "border-border bg-paper/95 text-ink border px-2 py-1"
          : "text-muted hover:text-ink underline-offset-4 hover:underline"
      }`}
    >
      {saved ? t.wishlistSaved : t.wishlistSave}
    </button>
  );
}
