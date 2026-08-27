"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics/events";

export function AnalyticsListener({ event }: { event: AnalyticsEvent }) {
  const key = JSON.stringify(event);

  useEffect(() => {
    track(event);
    // event is captured via key; stringify keeps repeat navigations distinct
  }, [key, event]);

  return null;
}
