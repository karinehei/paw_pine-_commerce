import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/fi") {
    return "/";
  }
  if (pathname.startsWith("/fi/")) {
    return pathname.slice(3) || "/";
  }
  return pathname || "/";
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

  if (locale === DEFAULT_LOCALE) {
    return `${stripped}${query}${hash}`;
  }

  const prefixed = stripped === "/" ? "/fi" : `/fi${stripped}`;
  return `${prefixed}${query}${hash}`;
}

export function switchLocaleHref(pathname: string, search: string, next: Locale): string {
  const path = withLocale(`${stripLocalePrefix(pathname)}${search}`, next);
  return path;
}
