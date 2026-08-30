"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useHasAnalyticsConsent } from "@/components/consent/ConsentProvider";
import { track } from "@/lib/analytics/events";

export function PageViewTracker() {
  const pathname = usePathname();
  const allowed = useHasAnalyticsConsent();

  useEffect(() => {
    if (!allowed) {
      return;
    }
    track({
      name: "page_view",
      page_path: pathname,
      page_title: document.title,
    });
  }, [pathname, allowed]);

  return null;
}
