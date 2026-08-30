"use client";

import { useSyncExternalStore } from "react";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useMessages } from "@/components/i18n/LocaleProvider";
import { getWishlistSnapshot, subscribeWishlist } from "@/lib/wishlist";

export function WishlistLink() {
  const t = useMessages();
  const count = useSyncExternalStore(
    subscribeWishlist,
    () => getWishlistSnapshot().length,
    () => 0,
  );

  return (
    <LocaleLink
      href="/wishlist"
      className="min-h-11 text-sm tracking-[0.12em] uppercase"
      aria-label={t.openWishlist(count)}
    >
      {t.wishlist}
      {count > 0 ? ` (${count})` : ""}
    </LocaleLink>
  );
}
