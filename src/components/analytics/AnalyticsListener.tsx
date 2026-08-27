"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics/events";

export function AnalyticsListener({ event }: { event: AnalyticsEvent }) {
  useEffect(() => {
    track(event);
  }, [event]);

  return null;
}
