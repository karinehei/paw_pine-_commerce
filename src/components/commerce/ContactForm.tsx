"use client";

import { useState, type FormEvent } from "react";
import { useMessages } from "@/components/i18n/LocaleProvider";

export function ContactForm() {
  const t = useMessages();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setStatus("error");
        setMessage(t.contactInvalid);
        return;
      }
      setStatus("success");
      setMessage(t.contactSuccess);
      form.reset();
    } catch {
      setStatus("error");
      setMessage(t.genericError);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-5">
      <div>
        <label htmlFor="name" className="text-sm">
          {t.name}
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          className="border-border bg-paper mt-1 min-h-11 w-full border px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-sm">
          {t.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="border-border bg-paper mt-1 min-h-11 w-full border px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="message" className="text-sm">
          {t.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="border-border bg-paper mt-1 min-h-11 w-full border px-3 py-2"
        />
      </div>
      <p id="contact-demo-disclaimer" className="text-muted text-xs">
        {t.contactDemo}
      </p>
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-pine text-paper min-h-12 px-5 text-sm tracking-[0.14em] uppercase disabled:opacity-60"
      >
        {status === "loading" ? t.sending : t.send}
      </button>
      {message ? (
        <p
          className={status === "error" ? "text-sale text-sm" : "text-muted text-sm"}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
