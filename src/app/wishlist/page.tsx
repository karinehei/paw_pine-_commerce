import { WishlistView } from "@/components/wishlist/WishlistView";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";
import { localizedAlternates } from "@/lib/i18n/path";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getMessages(locale);
  return {
    title: t.wishlist,
    description: t.wishlistMeta,
    robots: { index: false, follow: false },
    alternates: localizedAlternates("/wishlist", locale),
  };
}

export default async function WishlistPage() {
  const t = getMessages(await getLocale());
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-display text-4xl">{t.wishlist}</h1>
      <p className="text-muted mt-3 max-w-xl text-sm">{t.wishlistHelp}</p>
      <WishlistView />
    </div>
  );
}
