import { contentMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getMessages(locale);
  return contentMetadata({
    title: t.caseStudyTitle,
    description: t.caseStudyLead,
    path: "/case-study",
    locale,
  });
}

export default async function CaseStudyPage() {
  const t = getMessages(await getLocale());

  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <p className="text-label text-muted">{t.portfolioDemo}</p>
      <h1 className="font-display mt-3 text-4xl md:text-5xl">{t.caseStudyTitle}</h1>
      <p className="text-muted mt-6">{t.caseStudyLead}</p>
      <div className="mt-10 space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="font-display text-2xl">{t.information}</h2>
          <p className="text-muted mt-3">{t.caseStudyStack}</p>
        </section>
        <section>
          <h2 className="font-display text-2xl">{t.demoAnalyticsTitle}</h2>
          <p className="text-muted mt-3">{t.caseStudyHonesty}</p>
          <p className="mt-4">
            <LocaleLink
              href="/demo/analytics"
              className="underline-offset-4 hover:underline"
            >
              {t.demoAnalytics}
            </LocaleLink>
          </p>
        </section>
        <p>
          <LocaleLink href="/" className="underline-offset-4 hover:underline">
            {t.backToHome}
          </LocaleLink>
        </p>
      </div>
    </article>
  );
}
