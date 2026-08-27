import Link from "next/link";
import { Navigation } from "@/components/layout/Navigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchBox } from "@/components/commerce/SearchBox";
import { CartButton } from "@/components/layout/CartButton";
import { SITE_NAME } from "@/lib/constants";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-linen/95 backdrop-blur-sm">
      <p className="border-b border-border py-2 text-center text-xs tracking-[0.16em] text-muted uppercase">
        Complimentary shipping over €75
      </p>
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:flex md:gap-6 md:px-6 md:py-4">
        <MobileMenu />
        <Link
          href="/"
          className="justify-self-center text-center font-display text-2xl tracking-tight md:shrink-0 md:justify-self-start md:text-left md:text-3xl"
        >
          {SITE_NAME}
        </Link>
        <div className="hidden flex-1 md:block">
          <Navigation />
        </div>
        <div className="flex items-center justify-end gap-3 sm:gap-4">
          <div className="hidden w-40 sm:block lg:w-48">
            <SearchBox id="header-search" />
          </div>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
