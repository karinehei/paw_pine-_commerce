"use client";

import { useState, type FormEvent } from "react";
import { useMessages } from "@/components/i18n/LocaleProvider";
import { isEmail } from "@/lib/validation";

export function BackInStockForm({
  handle,
  variantId,
}: {
  handle: string;
  variantId?: string;
}) {
  const t = useMessages();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    if (typeof email !== "string" || !isEmail(email)) {
      setStatus("error");
      setMessage(t.invalidEmail);
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/notify-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, handle, variantId }),
      });
      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setStatus("error");
        setMessage(
          payload.message === "in_stock" ? t.backInStockInStock : t.invalidEmail,
        );
        return;
      }
      setStatus("success");
      setMessage(t.backInStockThanks);
      form.reset();
    } catch {
      setStatus("error");
      setMessage(t.genericError);
    }
  }

  return (
    <form onSubmit={onSubmit} className="border-border space-y-3 border-t pt-4">
      <p className="text-sm font-medium">{t.backInStockTitle}</p>
      <p className="text-muted text-xs">{t.backInStockDemo}</p>
      <label htmlFor="back-in-stock-email" className="sr-only">
        {t.emailAddress}
      </label>
      <div className="flex gap-2">
        <input
          id="back-in-stock-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={status === "loading" || status === "success"}
          placeholder={t.emailAddress}
          className="border-border bg-linen min-h-11 flex-1 border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="btn-secondary shrink-0 px-3 text-xs disabled:opacity-60"
        >
          {status === "loading" ? t.sending : t.backInStockNotify}
        </button>
      </div>
      {message ? (
        <p
          className={`text-sm ${status === "error" ? "text-sale" : "text-muted"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
