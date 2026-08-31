"use client";

import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useMessages } from "@/components/i18n/LocaleProvider";

const PRIMARY = [
  { href: "/collections/dogs", key: "dogs" as const },
  { href: "/collections/cats", key: "cats" as const },
  { href: "/collections/new-arrivals", key: "newArrivals" as const },
  { href: "/collections/best-sellers", key: "bestSellers" as const },
];

export function Navigation() {
  const t = useMessages();

  return (
    <nav aria-label={t.primaryNav} className="hidden md:block">
      <ul className="flex items-center gap-5 text-sm tracking-[0.1em] uppercase lg:gap-8">
        {PRIMARY.map((link) => (
          <li key={link.href}>
            <LocaleLink
              href={link.href}
              className="inline-flex min-h-11 items-center py-2"
            >
              {link.key === "dogs"
                ? t.dogs
                : link.key === "cats"
                  ? t.cats
                  : link.key === "newArrivals"
                    ? t.newArrivals
                    : t.bestSellers}
            </LocaleLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
