"use client";

import { useEffect } from "react";

type VitalName = "LCP" | "INP" | "CLS" | "FCP" | "TTFB";
type Rating = "good" | "needs-improvement" | "poor";

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

function ratingFor(name: VitalName, value: number): Rating {
  if (name === "CLS") {
    if (value <= 0.1) return "good";
    if (value <= 0.25) return "needs-improvement";
    return "poor";
  }
  const good = name === "LCP" ? 2500 : name === "INP" ? 200 : name === "FCP" ? 1800 : 800;
  const ok = name === "LCP" ? 4000 : name === "INP" ? 500 : name === "FCP" ? 3000 : 1800;
  if (value <= good) return "good";
  if (value <= ok) return "needs-improvement";
  return "poor";
}

function send(name: VitalName, value: number) {
  const path = window.location.pathname.slice(0, 120);
  const body = JSON.stringify({
    name,
    value: Math.round(value * 1000) / 1000,
    rating: ratingFor(name, value),
    path,
  });
  const blob = new Blob([body], { type: "application/json" });
  if (navigator.sendBeacon("/api/vitals", blob)) {
    return;
  }
  void fetch("/api/vitals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

export function WebVitalsBeacon() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }
    if (typeof PerformanceObserver === "undefined") {
      return;
    }

    let cls = 0;
    let lcp = 0;
    let inp = 0;
    let flushed = false;
    const observers: PerformanceObserver[] = [];

    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) {
          lcp = last.startTime;
        }
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
      observers.push(lcpObserver);
    } catch {
      /* unsupported */
    }

    try {
      const fcp = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            send("FCP", entry.startTime);
          }
        }
      });
      fcp.observe({ type: "paint", buffered: true });
      observers.push(fcp);
    } catch {
      /* unsupported */
    }

    try {
      const nav = performance.getEntriesByType("navigation")[0] as
        PerformanceNavigationTiming | undefined;
      if (nav) {
        send("TTFB", nav.responseStart);
      }
    } catch {
      /* unsupported */
    }

    try {
      const inpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          inp = Math.max(inp, entry.duration);
        }
      });
      inpObserver.observe({
        type: "event",
        buffered: true,
        durationThreshold: 40,
      } as PerformanceObserverInit);
      observers.push(inpObserver);
    } catch {
      /* unsupported */
    }

    try {
      const shift = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layout = entry as LayoutShiftEntry;
          if (!layout.hadRecentInput) {
            cls += layout.value;
          }
        }
      });
      shift.observe({ type: "layout-shift", buffered: true });
      observers.push(shift);
    } catch {
      /* unsupported */
    }

    function flush() {
      if (flushed) {
        return;
      }
      flushed = true;
      if (lcp > 0) {
        send("LCP", lcp);
      }
      if (inp > 0) {
        send("INP", inp);
      }
      send("CLS", cls);
    }

    window.addEventListener("pagehide", flush);
    function onHidden() {
      if (document.visibilityState === "hidden") {
        flush();
      }
    }
    document.addEventListener("visibilitychange", onHidden);

    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHidden);
      for (const observer of observers) {
        observer.disconnect();
      }
    };
  }, []);

  return null;
}
