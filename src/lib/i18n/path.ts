import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from "@/lib/i18n/config";

const LOCALE_PREFIX = new RegExp(`^/(${LOCALES.join("|")})(?=/|$)`);
const TWO_LETTER_SEGMENT = /^[a-z]{2}$/;

export function pathnameLocale(pathname: string): Locale | null {
  const match = pathname.match(LOCALE_PREFIX);
  const code = match?.[1];
  return isLocale(code) ? code : null;
}

export function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(LOCALE_PREFIX);
  if (!match) {
    return pathname || "/";
  }
  return pathname.slice(match[0].length) || "/";
}

export function withLocale(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) {
    return href;
  }

  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const [path, search = ""] = withoutHash.split("?");
  const query = search ? `?${search}` : "";
  const stripped = stripLocalePrefix(path || "/");
  const prefixed = stripped === "/" ? `/${locale}` : `/${locale}${stripped}`;
  return `${prefixed}${query}${hash}`;
}

export function switchLocaleHref(pathname: string, search: string, next: Locale): string {
  return withLocale(`${stripLocalePrefix(pathname)}${search}`, next);
}

export function hreflangLanguages(strippedPath: string): Record<string, string> {
  const languages: Record<string, string> = {
    "x-default": withLocale(strippedPath, DEFAULT_LOCALE),
  };
  for (const locale of LOCALES) {
    languages[locale] = withLocale(strippedPath, locale);
  }
  return languages;
}

export function localizedAlternates(strippedPath: string, locale: Locale) {
  return {
    canonical: withLocale(strippedPath, locale),
    languages: hreflangLanguages(strippedPath),
  };
}

export type LocaleRouting =
  | { kind: "rewrite"; locale: Locale; rewritePath: string }
  | { kind: "redirect"; location: string }
  | { kind: "not_found" };

export function resolveLocaleRouting(
  pathname: string,
  cookieValue?: string | null,
): LocaleRouting {
  const locale = pathnameLocale(pathname);
  if (locale) {
    return {
      kind: "rewrite",
      locale,
      rewritePath: stripLocalePrefix(pathname),
    };
  }

  const segment = pathname.split("/").filter(Boolean)[0];
  if (segment && TWO_LETTER_SEGMENT.test(segment) && !isLocale(segment)) {
    return { kind: "not_found" };
  }

  const preferred = isLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;
  return { kind: "redirect", location: withLocale(pathname || "/", preferred) };
}
