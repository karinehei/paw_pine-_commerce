"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLocale, useMessages } from "@/components/i18n/LocaleProvider";
import { htmlLang, LOCALES, LOCALE_SHORT_LABEL, type Locale } from "@/lib/i18n/config";
import { switchLocaleHref } from "@/lib/i18n/path";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useMessages();
  const search = searchParams.toString();
  const query = search ? `?${search}` : "";

  return (
    <nav
      aria-label={t.language}
      className="flex items-center gap-1 text-xs tracking-[0.12em] uppercase"
    >
      {LOCALES.map((code: Locale) => {
        const href = switchLocaleHref(pathname, query, code);
        const current = code === locale;
        return (
          // Full document navigation: /en/x and /sv/x both rewrite to /x, so
          // next/link would reuse the English layout and keep "Add to cart".
          <a
            key={code}
            href={href}
            hrefLang={code}
            lang={htmlLang(code)}
            aria-current={current ? "true" : undefined}
            className={`inline-flex min-h-11 items-center px-1.5 ${current ? "text-ink" : "text-muted hover:text-ink"}`}
          >
            {LOCALE_SHORT_LABEL[code]}
          </a>
        );
      })}
    </nav>
  );
}
