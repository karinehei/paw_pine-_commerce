"use client";

import { openCookiePreferences } from "@/components/consent/CookieConsent";

export function CookiePreferencesButton({
  label,
  className = "hover:text-pine min-h-11 text-left",
}: {
  label: string;
  className?: string;
}) {
  return (
    <button type="button" className={className} onClick={() => openCookiePreferences()}>
      {label}
    </button>
  );
}
