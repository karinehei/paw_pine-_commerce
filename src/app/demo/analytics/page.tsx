import { DemoAnalyticsDashboard } from "@/components/analytics/DemoAnalyticsDashboard";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";
import { localizedAlternates } from "@/lib/i18n/path";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getMessages(locale);
  return {
    title: t.demoAnalyticsTitle,
    description: t.demoAnalyticsIntro.slice(0, 160),
    robots: { index: false, follow: false },
    alternates: localizedAlternates("/demo/analytics", locale),
  };
}

export default async function DemoAnalyticsPage() {
  const t = getMessages(await getLocale());

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 md:px-6">
      <p className="text-sale text-xs tracking-[0.2em] uppercase">{t.demoData}</p>
      <h1 className="font-display mt-3 text-4xl md:text-5xl">{t.demoAnalyticsTitle}</h1>
      <p className="text-muted mt-4 max-w-2xl text-sm md:text-base">
        {t.demoAnalyticsIntro}
      </p>
      <div className="mt-12">
        <DemoAnalyticsDashboard />
      </div>
    </article>
  );
}
