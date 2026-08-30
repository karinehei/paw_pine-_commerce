import { CookiePreferencesButton } from "@/components/consent/CookiePreferencesButton";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";
import { contentMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getMessages(locale);
  return contentMetadata({
    title: t.cookiesTitle,
    description: t.cookiesMeta,
    path: "/cookies",
    locale,
  });
}

export default async function CookiesPage() {
  const t = getMessages(await getLocale());

  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <h1 className="font-display text-5xl">{t.cookiesTitle}</h1>
      <p className="text-muted mt-4">{t.cookiesLead}</p>
      <dl className="mt-10 space-y-6 text-sm">
        <div>
          <dt className="font-medium">{t.cookieNecessary}</dt>
          <dd className="text-muted mt-2">{t.cookieNecessaryHelp}</dd>
        </div>
        <div>
          <dt className="font-medium">{t.cookieAnalytics}</dt>
          <dd className="text-muted mt-2">{t.cookieAnalyticsHelp}</dd>
        </div>
      </dl>
      <div className="mt-10">
        <CookiePreferencesButton
          label={t.cookiesOpenPreferences}
          className="btn-secondary"
        />
      </div>
    </article>
  );
}
