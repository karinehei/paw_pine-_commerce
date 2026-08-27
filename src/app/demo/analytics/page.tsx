import { DemoAnalyticsDashboard } from "@/components/analytics/DemoAnalyticsDashboard";

export const metadata = {
  title: "Demo analytics",
  description: "Illustrative ecommerce funnel metrics for the Paw & Pine portfolio. Not live data.",
  robots: { index: false, follow: false },
};

export default function DemoAnalyticsPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 md:px-6">
      <p className="text-xs tracking-[0.2em] text-sale uppercase">Demo data — not production traffic</p>
      <h1 className="mt-3 font-display text-5xl">Ecommerce measurement</h1>
      <p className="mt-4 max-w-2xl text-muted">
        This page shows how the storefront thinks about a purchase funnel. The large numbers are a
        labelled sample dataset. Session events come from this browser only and are never sent to a
        vendor unless you connect one.
      </p>
      <div className="mt-12">
        <DemoAnalyticsDashboard />
      </div>
    </article>
  );
}
