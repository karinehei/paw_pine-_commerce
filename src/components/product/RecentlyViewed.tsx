"use client";

import { useEffect, useSyncExternalStore } from "react";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useMessages } from "@/components/i18n/LocaleProvider";
import {
  rememberProduct,
  subscribeRecentlyViewed,
  getRecentlyViewedExcept,
  type RecentProduct,
} from "@/lib/recently-viewed";

const EMPTY: RecentProduct[] = [];

export function RecentlyViewed({ current }: { current: RecentProduct }) {
  const t = useMessages();
  useEffect(() => {
    rememberProduct(current);
  }, [current]);

  const items = useSyncExternalStore(
    subscribeRecentlyViewed,
    () => getRecentlyViewedExcept(current.handle),
    () => EMPTY,
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-16" aria-labelledby="recently-viewed-heading">
      <h2 id="recently-viewed-heading" className="font-display mb-6 text-3xl">
        {t.recentlyViewed}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.handle}>
            <LocaleLink
              href={`/products/${item.handle}`}
              className="border-border bg-paper block min-h-11 border px-4 py-3"
            >
              <p className="text-muted text-xs tracking-[0.14em] uppercase">
                {item.vendor}
              </p>
              <p className="mt-1 font-medium">{item.title}</p>
            </LocaleLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
