import type { AnalyticsEvent } from "@/lib/analytics/types";

export interface DemoFunnelMetrics {
  sessions: number;
  productViews: number;
  addToCarts: number;
  checkouts: number;
  purchases: number;
  revenue: number;
}

/** Illustrative numbers for the portfolio funnel page. Not live traffic. */
export const ILLUSTRATIVE_FUNNEL: DemoFunnelMetrics = {
  sessions: 1280,
  productViews: 2140,
  addToCarts: 312,
  checkouts: 148,
  purchases: 91,
  revenue: 7862.4,
};

export function rate(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }
  return numerator / denominator;
}

export function averageOrderValue(metrics: DemoFunnelMetrics): number {
  if (metrics.purchases <= 0) {
    return 0;
  }
  return metrics.revenue / metrics.purchases;
}

export function metricsFromEvents(events: AnalyticsEvent[]): DemoFunnelMetrics {
  const productViews = events.filter((event) => event.name === "view_item").length;
  const addToCarts = events.filter((event) => event.name === "add_to_cart").length;
  const checkouts = events.filter((event) => event.name === "begin_checkout").length;
  const purchases = events.filter((event) => event.name === "purchase").length;
  const pageViews = events.filter((event) => event.name === "page_view").length;
  const revenue = events
    .filter((event) => event.name === "purchase")
    .reduce((sum, event) => sum + event.value, 0);

  return {
    sessions: Math.max(pageViews, 1),
    productViews,
    addToCarts,
    checkouts,
    purchases,
    revenue,
  };
}
