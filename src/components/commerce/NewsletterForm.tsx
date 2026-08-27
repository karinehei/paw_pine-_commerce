"use client";

import { useState, type FormEvent } from "react";
import { track } from "@/lib/analytics/events";

export function NewsletterForm() {
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
        setMessage(payload.message ?? "Please enter a valid email.");
        return;
      }
      setStatus("success");
      setMessage("Thank you — we will write when there is something worth sending.");
      form.reset();
      track({ name: "newsletter_signup" });
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
      <label htmlFor="newsletter-email" className="text-xs tracking-[0.16em] text-muted uppercase">
        Notes from the house
      </label>
      <div className="mt-3 flex gap-2">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email address"
          className="min-h-11 flex-1 border border-border bg-linen px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="min-h-11 bg-ink px-4 text-sm tracking-[0.12em] text-paper uppercase disabled:opacity-60"
        >
          {status === "loading" ? "Sending" : "Join"}
        </button>
      </div>
      {message ? (
        <p className={`mt-2 text-sm ${status === "error" ? "text-sale" : "text-muted"}`} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
