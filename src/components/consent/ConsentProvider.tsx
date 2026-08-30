"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  readConsent,
  subscribeConsent,
  writeConsent,
  type ConsentChoice,
  type ConsentState,
  UNDECIDED_CONSENT,
} from "@/lib/analytics/consent";

interface ConsentContextValue {
  state: ConsentState;
  hydrated: boolean;
  acceptAnalytics: () => void;
  necessaryOnly: () => void;
  setChoice: (choice: ConsentChoice) => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

function subscribe(onStoreChange: () => void) {
  return subscribeConsent(onStoreChange);
}

function subscribeNever() {
  return () => undefined;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, readConsent, () => UNDECIDED_CONSENT);
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  const setChoice = useCallback((choice: ConsentChoice) => {
    writeConsent(choice);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      state,
      hydrated,
      acceptAnalytics: () => setChoice("analytics"),
      necessaryOnly: () => setChoice("necessary"),
      setChoice,
    }),
    [state, hydrated, setChoice],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const value = useContext(ConsentContext);
  if (!value) {
    throw new Error("useConsent must be used within ConsentProvider");
  }
  return value;
}

export function useHasAnalyticsConsent(): boolean {
  const { state, hydrated } = useConsent();
  return hydrated && state.analytics;
}
