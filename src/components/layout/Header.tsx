import { Suspense } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchBox } from "@/components/commerce/SearchBox";
import { CartButton } from "@/components/layout/CartButton";
import { WishlistLink } from "@/components/wishlist/WishlistLink";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";
import { SITE_NAME } from "@/lib/constants";

export async function Header() {
  const t = getMessages(await getLocale());

  return (
    <header className="border-border bg-linen/95 sticky top-0 z-30 border-b backdrop-blur-sm">
      <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-1.5 md:px-6">
        <p className="text-muted flex-1 text-center text-[0.7rem] tracking-[0.16em] uppercase">
          {t.shippingBanner}
        </p>
        <div className="hidden shrink-0 opacity-70 md:block">
          <Suspense fallback={null}>
            <LanguageSwitcher />
          </Suspense>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 md:gap-8 md:px-6 md:py-3">
        <LocaleLink
          href="/"
          className="font-display shrink-0 text-xl tracking-tight md:text-2xl"
        >
          {SITE_NAME}
        </LocaleLink>
        <div className="hidden min-w-0 flex-1 md:block" aria-hidden={false}>
          <Navigation />
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <LocaleLink
            href="/search"
            className="inline-flex min-h-11 min-w-11 items-center justify-center md:hidden"
            aria-label={t.searchProducts}
          >
            <SearchIcon />
          </LocaleLink>
          <div className="hidden w-40 md:block lg:w-52">
            <SearchBox id="header-search" />
          </div>
          <WishlistLink />
          <CartButton />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
