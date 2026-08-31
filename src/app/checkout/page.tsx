import { notFound, redirect } from "next/navigation";
import { CheckoutUnlock } from "@/components/cart/CheckoutUnlock";
import { parseCheckoutTarget } from "@/lib/commerce/checkout";
import { getStorefrontPassword } from "@/lib/env";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";
import { firstSearchParam, type QueryPageProps } from "@/lib/page-props";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await getLocale());
  return {
    title: t.checkoutUnlockTitle,
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({ searchParams }: QueryPageProps) {
  const checkoutUrl = parseCheckoutTarget(firstSearchParam((await searchParams).to));
  if (!checkoutUrl) {
    notFound();
  }

  const password = getStorefrontPassword();
  if (!password) {
    redirect(checkoutUrl);
  }

  const t = getMessages(await getLocale());

  return (
    <article className="mx-auto max-w-md px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl">{t.checkoutUnlockTitle}</h1>
      <p className="text-muted mt-4">{t.checkoutUnlockBody}</p>
      <CheckoutUnlock password={password} checkoutUrl={checkoutUrl} />
    </article>
  );
}
