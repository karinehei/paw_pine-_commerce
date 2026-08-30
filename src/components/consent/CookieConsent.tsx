"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useConsent } from "@/components/consent/ConsentProvider";
import { useMessages } from "@/components/i18n/LocaleProvider";

export function CookieConsent() {
  const t = useMessages();
  const { state, hydrated, acceptAnalytics, necessaryOnly, setChoice } = useConsent();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analyticsDraft, setAnalyticsDraft] = useState(state.analytics);
  const titleId = useId();
  const bannerTitleId = useId();

  useEffect(() => {
    function onOpenPreferences() {
      setAnalyticsDraft(state.analytics);
      setPreferencesOpen(true);
    }
    window.addEventListener("paw-pine-open-cookie-preferences", onOpenPreferences);
    return () =>
      window.removeEventListener("paw-pine-open-cookie-preferences", onOpenPreferences);
  }, [state.analytics]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (preferencesOpen && !dialog.open) {
      dialog.showModal();
      closeRef.current?.focus();
    }
    if (!preferencesOpen && dialog.open) {
      dialog.close();
    }
  }, [preferencesOpen]);

  const showBanner = hydrated && !state.decided && !preferencesOpen;

  return (
    <>
      {showBanner ? (
        <div
          role="region"
          aria-labelledby={bannerTitleId}
          className="border-border bg-paper/95 fixed inset-x-0 bottom-0 z-40 border-t px-4 py-4 md:px-6"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p id={bannerTitleId} className="font-display text-xl">
                {t.cookieBannerTitle}
              </p>
              <p className="text-muted mt-2 text-sm">{t.cookieBannerBody}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" className="btn-primary" onClick={acceptAnalytics}>
                {t.cookieAcceptAnalytics}
              </button>
              <button type="button" className="btn-secondary" onClick={necessaryOnly}>
                {t.cookieNecessaryOnly}
              </button>
              <button
                type="button"
                className="text-muted min-h-11 px-3 text-sm underline-offset-4 hover:underline"
                onClick={() => {
                  setAnalyticsDraft(false);
                  setPreferencesOpen(true);
                }}
              >
                {t.cookieManagePreferences}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {preferencesOpen ? (
        <dialog
          ref={dialogRef}
          aria-labelledby={titleId}
          onClose={() => setPreferencesOpen(false)}
          className="bg-paper text-ink border-border w-full max-w-lg border p-0"
        >
          <form
            className="space-y-6 p-6"
            onSubmit={(event) => {
              event.preventDefault();
              setChoice(analyticsDraft ? "analytics" : "necessary");
              setPreferencesOpen(false);
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id={titleId} className="font-display text-2xl">
                {t.cookiePreferences}
              </h2>
              <button
                ref={closeRef}
                type="button"
                className="text-muted min-h-11 text-sm"
                onClick={() => setPreferencesOpen(false)}
              >
                {t.close}
              </button>
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">{t.cookieNecessary}</legend>
              <label className="text-muted flex min-h-11 items-center gap-3 text-sm">
                <input type="checkbox" checked disabled />
                <span>{t.cookieNecessaryHelp}</span>
              </label>
            </fieldset>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">{t.cookieAnalytics}</legend>
              <label className="flex min-h-11 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={analyticsDraft}
                  onChange={(event) => setAnalyticsDraft(event.target.checked)}
                />
                <span>{t.cookieAnalyticsHelp}</span>
              </label>
            </fieldset>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="submit" className="btn-primary">
                {t.cookieSavePreferences}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  acceptAnalytics();
                  setPreferencesOpen(false);
                }}
              >
                {t.cookieAcceptAnalytics}
              </button>
            </div>
          </form>
        </dialog>
      ) : null}
    </>
  );
}

export function openCookiePreferences(): void {
  window.dispatchEvent(new Event("paw-pine-open-cookie-preferences"));
}
