export const LOCALES = ["en", "fi"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_HEADER = "x-paw-pine-locale";
export const LOCALE_COOKIE = "paw_pine_locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "fi";
}

export function numberLocale(locale: Locale): string {
  return locale === "fi" ? "fi-FI" : "en-GB";
}

export function htmlLang(locale: Locale): string {
  return locale === "fi" ? "fi" : "en";
}

export function openGraphLocale(locale: Locale): string {
  return locale === "fi" ? "fi_FI" : "en_GB";
}

export function shopifyLanguage(locale: Locale): "EN" | "FI" {
  return locale === "fi" ? "FI" : "EN";
}
