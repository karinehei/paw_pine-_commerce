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
      <div className="border-border flex flex-col gap-2 border-b px-4 py-2 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <p className="text-muted text-center text-xs tracking-[0.16em] uppercase sm:flex-1">
          {t.shippingBanner}
        </p>
        <div className="flex justify-center sm:justify-end">
          <Suspense fallback={null}>
            <LanguageSwitcher />
          </Suspense>
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:flex md:gap-6 md:px-6 md:py-4">
        <MobileMenu />
        <LocaleLink
          href="/"
          className="font-display justify-self-center text-center text-2xl tracking-tight md:shrink-0 md:justify-self-start md:text-left md:text-3xl"
        >
          {SITE_NAME}
        </LocaleLink>
        <div className="hidden flex-1 md:block">
          <Navigation />
        </div>
        <div className="flex items-center justify-end gap-2 sm:gap-4">
          <div className="hidden w-40 sm:block lg:w-48">
            <SearchBox id="header-search" />
          </div>
          <CartButton />
          <WishlistLink />
        </div>
      </div>
    </header>
  );
}
