import Link from "next/link";
import { CAT_NAV, DOG_NAV, NAV_LINKS } from "@/lib/constants";

export function Navigation() {
  return (
    <nav aria-label="Primary" className="hidden md:block">
      <ul className="flex items-center gap-4 text-sm tracking-[0.08em] uppercase lg:gap-8 lg:tracking-[0.12em]">
        <li className="group relative">
          <Link href="/collections/dogs" className="inline-flex min-h-11 items-center py-2">
            Dogs
          </Link>
          <div className="invisible absolute top-full left-0 z-20 min-w-40 bg-paper pt-3 opacity-0 shadow-sm group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
            <ul className="border border-border p-3">
              {DOG_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block min-h-11 px-2 py-2 text-muted hover:text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </li>
        <li className="group relative">
          <Link href="/collections/cats" className="inline-flex min-h-11 items-center py-2">
            Cats
          </Link>
          <div className="invisible absolute top-full left-0 z-20 min-w-40 bg-paper pt-3 opacity-0 shadow-sm group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
            <ul className="border border-border p-3">
              {CAT_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block min-h-11 px-2 py-2 text-muted hover:text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </li>
        {NAV_LINKS.filter((link) => link.label !== "Dogs" && link.label !== "Cats").map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="inline-flex min-h-11 items-center py-2">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
