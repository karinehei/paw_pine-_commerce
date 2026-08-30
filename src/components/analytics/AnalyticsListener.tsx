"use client";

import { useEffect } from "react";
import { useHasAnalyticsConsent } from "@/components/consent/ConsentProvider";
import { track, type EcommerceEvent } from "@/lib/analytics/events";

export function AnalyticsListener({ event }: { event: EcommerceEvent }) {
  const allowed = useHasAnalyticsConsent();
  const key = JSON.stringify(event);

  useEffect(() => {
    if (!allowed) {
      return;
    }
    track(event);
  }, [key, event, allowed]);

  return null;
}
