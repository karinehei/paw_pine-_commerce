"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CAT_NAV, DOG_NAV, NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { SearchBox } from "@/components/commerce/SearchBox";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

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
        Menu
      </button>
      <dialog
        ref={dialogRef}
        id="mobile-menu"
        onClose={close}
        aria-label="Menu"
        className="fixed inset-y-0 left-0 m-0 h-full max-h-none w-full max-w-sm border-0 bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/40"
      >
        <div className="flex h-full flex-col px-6 py-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-xl">{SITE_NAME}</p>
            <button type="button" onClick={close} className="min-h-11 text-sm text-muted">
              Close
            </button>
          </div>
          <SearchBox id="mobile-search" className="mt-8" />
          <nav className="mt-8 space-y-6 text-sm tracking-[0.12em] uppercase">
            <div>
              <Link href="/collections/dogs" onClick={close} className="inline-flex min-h-11 items-center font-medium">
                Dogs
              </Link>
              <ul className="mt-2 space-y-1 normal-case tracking-normal text-muted">
                {DOG_NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={close} className="inline-flex min-h-11 items-center">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Link href="/collections/cats" onClick={close} className="inline-flex min-h-11 items-center font-medium">
                Cats
              </Link>
              <ul className="mt-2 space-y-1 normal-case tracking-normal text-muted">
                {CAT_NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={close} className="inline-flex min-h-11 items-center">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="space-y-1">
              {NAV_LINKS.filter((link) => link.label !== "Dogs" && link.label !== "Cats").map(
                (link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={close} className="inline-flex min-h-11 items-center">
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
              <li>
                <Link href="/about" onClick={close} className="inline-flex min-h-11 items-center">
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </dialog>
    </>
  );
}
