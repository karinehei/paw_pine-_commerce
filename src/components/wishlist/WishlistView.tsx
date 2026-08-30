"use client";

import { useSyncExternalStore } from "react";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useMessages } from "@/components/i18n/LocaleProvider";
import { ProductMedia } from "@/components/product/ProductMedia";
import { ProductPrice } from "@/components/product/ProductPrice";
import { EmptyState } from "@/components/ui/EmptyState";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { ProductGridSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  getWishlistSnapshot,
  subscribeWishlist,
  type WishlistItem,
} from "@/lib/wishlist";

const EMPTY: WishlistItem[] = [];

function subscribeNever() {
  return () => undefined;
}

export function WishlistView() {
  const t = useMessages();
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const items = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot, () => EMPTY);

  if (!hydrated) {
    return <ProductGridSkeleton />;
  }

  if (items.length === 0) {
    return (
      <>
        <EmptyState
          title={t.emptyWishlistTitle}
          description={t.emptyWishlistDescription}
          action={{ href: "/collections/all", label: t.browseTheShop }}
          heading="h2"
        />
        <RecentlyViewed />
      </>
    );
  }

  return (
    <>
      <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.handle}>
            <article className="relative">
              <div className="absolute top-3 right-3 z-10">
                <WishlistButton product={item} compact />
              </div>
              <LocaleLink
                href={`/products/${item.handle}`}
                className="group block min-h-11 focus-visible:outline-none"
              >
                <div className="bg-stone relative aspect-[4/5] overflow-hidden">
                  <ProductMedia
                    product={{ title: item.title, visual: item.visual }}
                    image={item.image}
                  />
                  {!item.availableForSale ? (
                    <span className="bg-paper text-muted absolute top-3 left-3 px-2 py-1 text-xs tracking-wide uppercase">
                      {t.soldOut}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 space-y-1.5">
                  <p className="text-muted text-[0.7rem] tracking-[0.16em] uppercase">
                    {item.vendor}
                  </p>
                  <h2 className="text-ink group-hover:text-pine text-sm font-medium text-pretty md:text-base">
                    {item.title}
                  </h2>
                  <ProductPrice
                    price={item.price}
                    compareAtPrice={item.compareAtPrice}
                    className="text-sm"
                  />
                </div>
              </LocaleLink>
            </article>
          </li>
        ))}
      </ul>
      <RecentlyViewed />
    </>
  );
}
