"use client";

import { useEffect, useRef, useState } from "react";
import { CAT_NAV, DOG_NAV, NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { SearchBox } from "@/components/commerce/SearchBox";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useMessages } from "@/components/i18n/LocaleProvider";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
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

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="min-h-11 text-sm tracking-[0.12em] uppercase md:hidden"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
      >
        {t.menu}
      </button>
      <dialog
        ref={dialogRef}
        id="mobile-menu"
        onClose={close}
        aria-label={t.menu}
        className="bg-paper text-ink border-border backdrop:bg-ink/40 fixed inset-y-0 left-0 m-0 h-full max-h-none w-full max-w-sm border-r p-0"
      >
        <div className="flex h-full flex-col px-6 py-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-xl">{SITE_NAME}</p>
            <button type="button" onClick={close} className="text-muted min-h-11 text-sm">
              {t.close}
            </button>
          </div>
          <SearchBox id="mobile-search" className="mt-8" />
          <nav className="mt-8 space-y-6 text-sm tracking-[0.12em] uppercase">
            <div>
              <LocaleLink
                href="/collections/dogs"
                onClick={close}
                className="inline-flex min-h-11 items-center font-medium"
              >
                {t.dogs}
              </LocaleLink>
              <ul className="text-muted mt-2 space-y-1 tracking-normal normal-case">
                {DOG_NAV.map((item) => (
                  <li key={item.href}>
                    <LocaleLink
                      href={item.href}
                      onClick={close}
                      className="inline-flex min-h-11 items-center"
                    >
                      {dogLabels[item.label] ?? item.label}
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <LocaleLink
                href="/collections/cats"
                onClick={close}
                className="inline-flex min-h-11 items-center font-medium"
              >
                {t.cats}
              </LocaleLink>
              <ul className="text-muted mt-2 space-y-1 tracking-normal normal-case">
                {CAT_NAV.map((item) => (
                  <li key={item.href}>
                    <LocaleLink
                      href={item.href}
                      onClick={close}
                      className="inline-flex min-h-11 items-center"
                    >
                      {catLabels[item.label] ?? item.label}
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="space-y-1">
              {NAV_LINKS.filter(
                (link) => link.label !== "Dogs" && link.label !== "Cats",
              ).map((link) => (
                <li key={link.href}>
                  <LocaleLink
                    href={link.href}
                    onClick={close}
                    className="inline-flex min-h-11 items-center"
                  >
                    {link.label === "New" ? t.newShort : t.bestSellers}
                  </LocaleLink>
                </li>
              ))}
              <li>
                <LocaleLink
                  href="/wishlist"
                  onClick={close}
                  className="inline-flex min-h-11 items-center"
                >
                  {t.wishlist}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink
                  href="/about"
                  onClick={close}
                  className="inline-flex min-h-11 items-center"
                >
                  {t.about}
                </LocaleLink>
              </li>
            </ul>
          </nav>
        </div>
      </dialog>
    </>
  );
}
