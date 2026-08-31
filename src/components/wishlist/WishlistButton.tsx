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
      className={
        compact
          ? "bg-paper/90 text-ink inline-flex min-h-11 min-w-11 items-center justify-center"
          : "text-muted hover:text-ink inline-flex min-h-11 items-center gap-2 text-sm underline-offset-4 hover:underline"
      }
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill={saved ? "currentColor" : "none"}
        />
      </svg>
      {compact ? null : <span>{saved ? t.wishlistSaved : t.wishlistSave}</span>}
    </button>
  );
}
