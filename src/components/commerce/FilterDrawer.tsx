"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMessages } from "@/components/i18n/LocaleProvider";

export function FilterDrawer({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const t = useMessages();

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
      triggerRef.current?.focus();
    }
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        className="border-border min-h-11 border px-4 text-sm tracking-[0.12em] uppercase"
        aria-expanded={open}
        aria-controls="filter-drawer"
        onClick={() => setOpen(true)}
      >
        {t.filter}
      </button>
      <dialog
        ref={dialogRef}
        id="filter-drawer"
        aria-label={t.filter}
        aria-modal="true"
        onClose={() => setOpen(false)}
        className="bg-paper text-ink border-border backdrop:bg-ink/40 mt-auto mb-0 h-[min(85dvh,40rem)] w-full max-w-none border-t p-0"
      >
        <div className="flex h-full flex-col">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm tracking-[0.12em] uppercase">{t.filterAndSort}</h2>
            <button
              type="button"
              className="text-muted min-h-11 text-sm"
              onClick={() => setOpen(false)}
            >
              {t.close}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6">{children}</div>
        </div>
      </dialog>
    </div>
  );
}
