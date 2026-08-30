"use client";

import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useMessages } from "@/components/i18n/LocaleProvider";
import { CAT_NAV, DOG_NAV, NAV_LINKS } from "@/lib/constants";

export function Navigation() {
  const t = useMessages();
  const dogLabels: Record<string, string> = {
    Toys: t.toys,
    Harnesses: t.harnesses,
    Beds: t.beds,
    Feeding: t.feeding,
  };
  const catLabels: Record<string, string> = {
    Toys: t.toys,
    Scratching: t.scratching,
    Beds: t.beds,
    Feeding: t.feeding,
  };

  return (
    <nav aria-label={t.primaryNav} className="hidden md:block">
      <ul className="flex items-center gap-4 text-sm tracking-[0.08em] uppercase lg:gap-8 lg:tracking-[0.12em]">
        <li className="group relative">
          <LocaleLink
            href="/collections/dogs"
            className="inline-flex min-h-11 items-center py-2"
          >
            {t.dogs}
          </LocaleLink>
          <div className="bg-paper invisible absolute top-full left-0 z-20 min-w-40 pt-3 opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
            <ul className="border-border border p-3">
              {DOG_NAV.map((item) => (
                <li key={item.href}>
                  <LocaleLink
                    href={item.href}
                    className="text-muted hover:text-ink block min-h-11 px-2 py-2"
                  >
                    {dogLabels[item.label] ?? item.label}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </div>
        </li>
        <li className="group relative">
          <LocaleLink
            href="/collections/cats"
            className="inline-flex min-h-11 items-center py-2"
          >
            {t.cats}
          </LocaleLink>
          <div className="bg-paper invisible absolute top-full left-0 z-20 min-w-40 pt-3 opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
            <ul className="border-border border p-3">
              {CAT_NAV.map((item) => (
                <li key={item.href}>
                  <LocaleLink
                    href={item.href}
                    className="text-muted hover:text-ink block min-h-11 px-2 py-2"
                  >
                    {catLabels[item.label] ?? item.label}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </div>
        </li>
        {NAV_LINKS.filter((link) => link.label !== "Dogs" && link.label !== "Cats").map(
          (link) => (
            <li key={link.href}>
              <LocaleLink
                href={link.href}
                className="inline-flex min-h-11 items-center py-2"
              >
                {link.label === "New" ? t.newShort : t.bestSellers}
              </LocaleLink>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
