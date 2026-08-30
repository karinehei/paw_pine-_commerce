import {
  CONSENT_COOKIE,
  CONSENT_EVENT,
  CONSENT_MAX_AGE,
  SESSION_EVENTS_KEY,
} from "@/lib/analytics/types";

export type ConsentChoice = "necessary" | "analytics";

export interface ConsentState {
  necessary: true;
  analytics: boolean;
  decided: boolean;
}

export const UNDECIDED_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  decided: false,
};

const ANALYTICS_CONSENT: ConsentState = {
  necessary: true,
  analytics: true,
  decided: true,
};

const NECESSARY_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  decided: true,
};

export function consentFromCookieValue(value: string | null | undefined): ConsentState {
  // Stable references: ConsentProvider uses useSyncExternalStore, which
  // re-renders forever if getSnapshot returns a new object each time.
  if (value === "analytics") {
    return ANALYTICS_CONSENT;
  }
  if (value === "necessary") {
    return NECESSARY_CONSENT;
  }
  return UNDECIDED_CONSENT;
}

export function cookieValueFromConsent(state: ConsentState): ConsentChoice | null {
  if (!state.decided) {
    return null;
  }
  return state.analytics ? "analytics" : "necessary";
}

export function hasAnalyticsConsent(state: ConsentState = readConsent()): boolean {
  return state.decided && state.analytics;
}

export function readConsent(): ConsentState {
  if (typeof document === "undefined") {
    return UNDECIDED_CONSENT;
  }
  return consentFromCookieValue(readCookie(CONSENT_COOKIE));
}

export function writeConsent(choice: ConsentChoice): ConsentState {
  const state: ConsentState = {
    necessary: true,
    analytics: choice === "analytics",
    decided: true,
  };
  if (typeof document === "undefined") {
    return state;
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${choice}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secure}`;
  if (!state.analytics) {
    clearSessionEvents();
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
  return state;
}

export function subscribeConsent(onChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

function readCookie(name: string): string | undefined {
  const prefix = `${name}=`;
  return document.cookie
    .split("; ")
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

function clearSessionEvents(): void {
  try {
    window.sessionStorage.removeItem(SESSION_EVENTS_KEY);
  } catch {
    // Storage may be blocked.
  }
}
