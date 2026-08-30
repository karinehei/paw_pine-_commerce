import { hasAnalyticsConsent } from "@/lib/analytics/consent";
import {
  createDataLayerAnalyticsProvider,
  createDevelopmentAnalyticsProvider,
  createSessionAnalyticsProvider,
  type AnalyticsProvider,
} from "@/lib/analytics/providers";
import type { EcommerceEvent } from "@/lib/analytics/types";

const DEDUPE_WINDOW_MS = 250;

export interface AnalyticsRuntime {
  track(event: EcommerceEvent): void;
}

export function createAnalyticsRuntime(options: {
  providers: AnalyticsProvider[];
  isAllowed: () => boolean;
  now?: () => number;
  dedupeWindowMs?: number;
}): AnalyticsRuntime {
  let lastKey = "";
  let lastAt = 0;
  const windowMs = options.dedupeWindowMs ?? DEDUPE_WINDOW_MS;

  return {
    track(event) {
      if (!options.isAllowed()) {
        return;
      }
      const key = JSON.stringify(event);
      const at = options.now?.() ?? Date.now();
      if (key === lastKey && at - lastAt < windowMs) {
        return;
      }
      lastKey = key;
      lastAt = at;
      for (const provider of options.providers) {
        void provider.track(event);
      }
    },
  };
}

let runtime: AnalyticsRuntime | undefined;

function getRuntime(): AnalyticsRuntime {
  if (!runtime) {
    const providers: AnalyticsProvider[] = [
      createDataLayerAnalyticsProvider(),
      createSessionAnalyticsProvider(),
    ];
    const debug =
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true";
    if (debug) {
      providers.push(createDevelopmentAnalyticsProvider());
    }
    runtime = createAnalyticsRuntime({
      providers,
      isAllowed: () => typeof window !== "undefined" && hasAnalyticsConsent(),
    });
  }
  return runtime;
}

export function track(event: EcommerceEvent): void {
  if (typeof window === "undefined") {
    return;
  }
  getRuntime().track(event);
}

export type {
  AnalyticsEvent,
  AnalyticsItem,
  EcommerceEvent,
} from "@/lib/analytics/types";
export type { AnalyticsProvider } from "@/lib/analytics/providers";
