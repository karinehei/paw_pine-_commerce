"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale, useMessages } from "@/components/i18n/LocaleProvider";
import { LOCALES, type Locale } from "@/lib/i18n/config";
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
          <Link
            key={code}
            href={href}
            hrefLang={code}
            aria-current={current ? "true" : undefined}
            className={`min-h-11 px-1.5 ${current ? "text-ink" : "text-muted hover:text-ink"}`}
          >
            {code === "fi" ? t.languageFi : t.languageEn}
          </Link>
        );
      })}
    </nav>
  );
}
