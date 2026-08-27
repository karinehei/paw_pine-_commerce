"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  rememberProduct,
  subscribeRecentlyViewed,
  getRecentlyViewedExcept,
  type RecentProduct,
} from "@/lib/recently-viewed";

const EMPTY: RecentProduct[] = [];

export function RecentlyViewed({
  current,
}: {
  current: RecentProduct;
}) {
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
      <h2 id="recently-viewed-heading" className="mb-6 font-display text-3xl">
        Recently viewed
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.handle}>
            <Link
              href={`/products/${item.handle}`}
              className="block min-h-11 border border-border bg-paper px-4 py-3"
            >
              <p className="text-xs tracking-[0.14em] text-muted uppercase">{item.vendor}</p>
              <p className="mt-1 font-medium">{item.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
