"use client";

import { useSyncExternalStore } from "react";
import {
  averageOrderValue,
  ILLUSTRATIVE_FUNNEL,
  metricsFromEvents,
  rate,
  type DemoFunnelMetrics,
} from "@/lib/analytics/funnel";
import { SESSION_EVENTS_KEY } from "@/lib/analytics/types";
import type { AnalyticsEvent } from "@/lib/analytics/types";

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function money(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-paper px-4 py-5">
      <p className="text-xs tracking-[0.16em] text-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}

function Funnel({ metrics, caption }: { metrics: DemoFunnelMetrics; caption: string }) {
  const steps = [
    { label: "Sessions", value: metrics.sessions },
    { label: "Product views", value: metrics.productViews },
    { label: "Add to cart", value: metrics.addToCarts },
    { label: "Checkout", value: metrics.checkouts },
    { label: "Purchase", value: metrics.purchases },
  ];
  const max = Math.max(...steps.map((step) => step.value), 1);

  return (
    <div>
      <p className="mb-4 text-sm text-muted">{caption}</p>
      <ol className="space-y-3">
        {steps.map((step) => (
          <li key={step.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{step.label}</span>
              <span>{step.value}</span>
            </div>
            <div className="h-2 bg-stone">
              <div className="h-2 bg-pine" style={{ width: `${(step.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function subscribeSessionEvents(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

const EMPTY_EVENTS: AnalyticsEvent[] = [];
let cachedRaw: string | null | undefined;
let cachedEvents: AnalyticsEvent[] = EMPTY_EVENTS;

function getSessionSnapshot(): AnalyticsEvent[] {
  try {
    const raw = window.sessionStorage.getItem(SESSION_EVENTS_KEY);
    if (raw === cachedRaw) {
      return cachedEvents;
    }
    cachedRaw = raw;
    cachedEvents = raw ? (JSON.parse(raw) as AnalyticsEvent[]) : EMPTY_EVENTS;
    return cachedEvents;
  } catch {
    cachedEvents = EMPTY_EVENTS;
    return cachedEvents;
  }
}

export function DemoAnalyticsDashboard() {
  const sessionEvents = useSyncExternalStore(
    subscribeSessionEvents,
    getSessionSnapshot,
    () => EMPTY_EVENTS,
  );

  const sessionMetrics = metricsFromEvents(sessionEvents);
  const illustrative = ILLUSTRATIVE_FUNNEL;

  return (
    <div className="space-y-12">
      <section>
        <h2 className="font-display text-3xl">Illustrative demo dataset</h2>
        <p className="mt-2 text-sm text-muted">
          These figures are invented for the portfolio. They are not live Shopify or analytics
          traffic.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label="Sessions" value={String(illustrative.sessions)} />
          <Metric label="Product views" value={String(illustrative.productViews)} />
          <Metric
            label="Add-to-cart rate"
            value={percent(rate(illustrative.addToCarts, illustrative.sessions))}
          />
          <Metric
            label="Checkout-start rate"
            value={percent(rate(illustrative.checkouts, illustrative.sessions))}
          />
          <Metric
            label="Purchase conversion"
            value={percent(rate(illustrative.purchases, illustrative.sessions))}
          />
          <Metric label="Average order value" value={money(averageOrderValue(illustrative))} />
        </div>
        <div className="mt-8">
          <Funnel
            metrics={illustrative}
            caption="Demo data: sessions → product views → add to cart → checkout → purchase"
          />
        </div>
      </section>
      <section>
        <h2 className="font-display text-3xl">This browser session</h2>
        <p className="mt-2 text-sm text-muted">
          Events recorded in sessionStorage on this device only. Empty until you browse the shop.
          Still demo instrumentation — not a production property.
        </p>
        <p className="mt-4 text-sm">{sessionEvents.length} events stored locally.</p>
        <div className="mt-6">
          <Funnel metrics={sessionMetrics} caption="Session funnel from local events" />
        </div>
      </section>
    </div>
  );
}
