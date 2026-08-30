const VITAL_NAMES = ["LCP", "INP", "CLS", "FCP", "TTFB"] as const;
const RATINGS = ["good", "needs-improvement", "poor"] as const;

export type WebVitalName = (typeof VITAL_NAMES)[number];
export type WebVitalRating = (typeof RATINGS)[number];

export interface WebVitalReport {
  name: WebVitalName;
  value: number;
  rating: WebVitalRating;
  path: string;
}

function isVitalName(value: unknown): value is WebVitalName {
  return typeof value === "string" && (VITAL_NAMES as readonly string[]).includes(value);
}

function isRating(value: unknown): value is WebVitalRating {
  return typeof value === "string" && (RATINGS as readonly string[]).includes(value);
}

function sanitisePath(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const path = value.split("?")[0]?.split("#")[0] ?? "";
  if (!path.startsWith("/") || path.length > 120 || path.includes("@")) {
    return null;
  }
  if (!/^\/[A-Za-z0-9/_-]*$/.test(path)) {
    return null;
  }
  return path;
}

export function parseWebVitalReport(body: unknown): WebVitalReport | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  const record = body as Record<string, unknown>;
  if (!isVitalName(record.name) || !isRating(record.rating)) {
    return null;
  }
  if (typeof record.value !== "number" || !Number.isFinite(record.value)) {
    return null;
  }
  const max = record.name === "CLS" ? 10 : 60_000;
  if (record.value < 0 || record.value > max) {
    return null;
  }
  const path = sanitisePath(record.path);
  if (!path) {
    return null;
  }
  return {
    name: record.name,
    value: record.value,
    rating: record.rating,
    path,
  };
}
