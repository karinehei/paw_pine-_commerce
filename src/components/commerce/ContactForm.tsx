"use client";

import { useState, type FormEvent } from "react";

export function ContactForm() {
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
        setMessage(payload.message ?? "Please check the form and try again.");
        return;
      }
      setStatus("success");
      setMessage("Received. We reply within two working days.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-5">
      <div>
        <label htmlFor="name" className="text-sm">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          className="mt-1 min-h-11 w-full border border-border bg-paper px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-sm">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 min-h-11 w-full border border-border bg-paper px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="message" className="text-sm">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="mt-1 min-h-11 w-full border border-border bg-paper px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-pine min-h-12 px-5 text-sm tracking-[0.14em] text-paper uppercase disabled:opacity-60"
      >
        {status === "loading" ? "Sending" : "Send"}
      </button>
      {message ? (
        <p className={status === "error" ? "text-sm text-sale" : "text-sm text-muted"} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
