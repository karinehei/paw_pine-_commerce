import { DemoAnalyticsDashboard } from "@/components/analytics/DemoAnalyticsDashboard";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";

export const metadata = {
  title: "Demo analytics",
  description:
    "Illustrative ecommerce funnel metrics for the Paw & Pine portfolio. Not live data.",
  robots: { index: false, follow: false },
};

export default async function DemoAnalyticsPage() {
  const t = getMessages(await getLocale());

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 md:px-6">
      <p className="text-sale text-xs tracking-[0.2em] uppercase">{t.demoData}</p>
      <h1 className="font-display mt-3 text-5xl">Ecommerce measurement</h1>
      <p className="text-muted mt-4 max-w-2xl">
        This page shows how the storefront thinks about a purchase funnel. The large
        numbers are a labelled sample dataset. Session events come from this browser only,
        only after analytics consent, and are never sent to a vendor unless you connect
        one.
      </p>
      <div className="mt-12">
        <DemoAnalyticsDashboard />
      </div>
    </article>
  );
}
