export const LOCALES = ["fi", "en", "sv"] as const;
export type Locale = (typeof LOCALES)[number];

/** Default market language. Every public URL is prefixed (`/fi`, `/en`, `/sv`). */
export const DEFAULT_LOCALE: Locale = "fi";

export const LOCALE_HEADER = "x-paw-pine-locale";
export const LOCALE_COOKIE = "paw_pine_locale";

export const NUMBER_LOCALES: Record<Locale, string> = {
  fi: "fi-FI",
  en: "en-GB",
  sv: "sv-SE",
};

export const HTML_LANG: Record<Locale, string> = {
  fi: "fi",
  en: "en",
  sv: "sv",
};

export const OPEN_GRAPH_LOCALE: Record<Locale, string> = {
  fi: "fi_FI",
  en: "en_GB",
  sv: "sv_SE",
};

export const SHOPIFY_LANGUAGE: Record<Locale, "FI" | "EN" | "SV"> = {
  fi: "FI",
  en: "EN",
  sv: "SV",
};

/** Finnish market for every storefront language. Contextual cart/catalogue pricing. */
export const SHOPIFY_COUNTRY: Record<Locale, "FI"> = {
  fi: "FI",
  en: "FI",
  sv: "FI",
};

export const LOCALE_SHORT_LABEL: Record<Locale, string> = {
  fi: "FI",
  en: "EN",
  sv: "SV",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && (LOCALES as readonly string[]).includes(value));
}

export function numberLocale(locale: Locale): string {
  return NUMBER_LOCALES[locale];
}

export function htmlLang(locale: Locale): string {
  return HTML_LANG[locale];
}

export function openGraphLocale(locale: Locale): string {
  return OPEN_GRAPH_LOCALE[locale];
}

export function shopifyLanguage(locale: Locale): "EN" | "FI" | "SV" {
  return SHOPIFY_LANGUAGE[locale];
}
