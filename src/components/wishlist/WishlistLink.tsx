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
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center"
      aria-label={t.openWishlist(count)}
    >
      <span className="hidden text-sm tracking-[0.12em] uppercase md:inline">
        {t.wishlist}
      </span>
      <svg
        className="md:hidden"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      {count > 0 ? (
        <span className="bg-pine text-paper md:text-ink absolute -top-0.5 -right-0.5 min-w-4 px-1 text-center text-[0.65rem] leading-4 md:static md:ml-1 md:bg-transparent md:px-0 md:text-sm md:leading-normal">
          <span className="md:hidden">{count}</span>
          <span className="hidden md:inline">({count})</span>
        </span>
      ) : null}
    </LocaleLink>
  );
}
