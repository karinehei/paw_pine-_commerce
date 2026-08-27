"use client";

import { useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/layout/Navigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchInput } from "@/components/commerce/SearchInput";
import { useCart } from "@/components/cart/CartProvider";
import { SITE_NAME } from "@/lib/constants";

export function Header() {
  const { cart, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const count = cart?.totalQuantity ?? 0;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-linen/95 backdrop-blur-sm">
      <p className="border-b border-border py-2 text-center text-xs tracking-[0.16em] text-muted uppercase">
        Complimentary shipping over €75
      </p>
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4 md:px-6">
        <button
          type="button"
          className="text-sm tracking-[0.12em] uppercase lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          Menu
        </button>
        <Link href="/" className="font-display text-2xl tracking-tight md:text-3xl">
          {SITE_NAME}
        </Link>
        <div className="flex-1">
          <Navigation />
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden w-40 sm:block">
            <SearchInput id="header-search" />
          </div>
          <button
            type="button"
            onClick={openCart}
            className="text-sm tracking-[0.12em] uppercase"
            aria-label={`Open bag, ${count} items`}
          >
            Bag{count > 0 ? ` (${count})` : ""}
          </button>
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
