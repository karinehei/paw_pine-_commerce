"use client";

import { useEffect, useState } from "react";
import { useMessages } from "@/components/i18n/LocaleProvider";

export function CheckoutUnlock({
  password,
  checkoutUrl,
}: {
  password: string;
  checkoutUrl: string;
}) {
  const t = useMessages();
  const [needsPaste, setNeedsPaste] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await navigator.clipboard.writeText(password);
        if (!cancelled) {
          window.location.assign(checkoutUrl);
        }
      } catch {
        if (!cancelled) {
          setNeedsPaste(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [password, checkoutUrl]);

  async function continueToCheckout() {
    try {
      await navigator.clipboard.writeText(password);
    } catch {
      /* password is visible on the page */
    }
    window.location.assign(checkoutUrl);
  }

  if (!needsPaste) {
    return <p className="text-muted mt-6 text-sm">{t.checkoutUnlocking}</p>;
  }

  return (
    <div className="mt-8 space-y-6">
      <p className="text-muted text-sm">{t.checkoutUnlockCopyFailed}</p>
      <p>
        <span className="text-label text-muted">{t.checkoutUnlockPassword}</span>
        <code className="bg-stone mt-2 block px-4 py-3 font-mono text-sm">
          {password}
        </code>
      </p>
      <button
        type="button"
        className="btn-primary"
        onClick={() => void continueToCheckout()}
      >
        {t.checkoutUnlockContinue}
      </button>
    </div>
  );
}
