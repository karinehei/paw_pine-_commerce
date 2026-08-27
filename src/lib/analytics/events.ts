import {
  createConsoleAdapter,
  createDataLayerAdapter,
  createSessionAdapter,
  type AnalyticsAdapter,
} from "@/lib/analytics/adapters";
import type { AnalyticsEvent } from "@/lib/analytics/types";

let adapters: AnalyticsAdapter[] | undefined;

function getAdapters(): AnalyticsAdapter[] {
  if (adapters) {
    return adapters;
  }

  const next: AnalyticsAdapter[] = [createDataLayerAdapter(), createSessionAdapter()];
  const debug =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true";
  if (debug) {
    next.push(createConsoleAdapter());
  }
  adapters = next;
  return next;
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const adapter of getAdapters()) {
    adapter.track(event);
  }
}

export type { AnalyticsEvent, AnalyticsItem } from "@/lib/analytics/types";
