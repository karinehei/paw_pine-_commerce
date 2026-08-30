"use client";

import { useState, type FormEvent } from "react";
import { track } from "@/lib/analytics/events";
import { useMessages } from "@/components/i18n/LocaleProvider";

export function NewsletterForm() {
  const t = useMessages();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    if (typeof email !== "string") {
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setStatus("error");
        setMessage(payload.message ?? t.invalidEmail);
        return;
      }
      setStatus("success");
      setMessage(t.newsletterThanks);
      form.reset();
      track({ name: "newsletter_signup" });
    } catch {
      setStatus("error");
      setMessage(t.genericError);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
      <label
        htmlFor="newsletter-email"
        className="text-muted text-xs tracking-[0.16em] uppercase"
      >
        {t.notesFromTheHouse}
      </label>
      <div className="mt-3 flex gap-2">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t.emailAddress}
          className="border-border bg-linen min-h-11 flex-1 border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-ink text-paper min-h-11 px-4 text-sm tracking-[0.12em] uppercase disabled:opacity-60"
        >
          {status === "loading" ? t.sending : t.join}
        </button>
      </div>
      {message ? (
        <p
          className={`mt-2 text-sm ${status === "error" ? "text-sale" : "text-muted"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
