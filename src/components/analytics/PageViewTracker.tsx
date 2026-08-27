"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics/events";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track({
      name: "page_view",
      page_path: pathname,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
