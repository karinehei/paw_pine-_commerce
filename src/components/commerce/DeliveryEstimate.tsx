"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useMessages } from "@/components/i18n/LocaleProvider";
import { numberLocale } from "@/lib/i18n/config";
import { formatMoney, moneyFromNumber } from "@/lib/format";
import { isFinnishPostalCode } from "@/lib/validation";
import type { ShippingRate } from "@/lib/shipping/types";

const RATE_LABELS: Record<
  string,
  "deliveryLocker" | "deliveryServicePoint" | "deliveryHome"
> = {
  "demo-locker": "deliveryLocker",
  "demo-service-point": "deliveryServicePoint",
  "demo-home": "deliveryHome",
};

export function DeliveryEstimate() {
  const t = useMessages();
  const locale = numberLocale(useLocale());
  const [postalCode, setPostalCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [rates, setRates] = useState<ShippingRate[]>([]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFinnishPostalCode(postalCode)) {
      setStatus("error");
      setRates([]);
      setMessage(t.deliveryInvalidPostcode);
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postalCode: postalCode.trim() }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        rates?: ShippingRate[];
      };
      if (!response.ok || !payload.ok || !payload.rates) {
        setStatus("error");
        setRates([]);
        setMessage(t.deliveryInvalidPostcode);
        return;
      }
      setRates(payload.rates);
      setStatus("success");
    } catch {
      setStatus("error");
      setRates([]);
      setMessage(t.genericError);
    }
  }

  return (
    <section
      className="border-border space-y-3 border-t pt-4"
      aria-labelledby="delivery-estimate-title"
    >
      <h2 id="delivery-estimate-title" className="text-sm font-medium">
        {t.deliveryEstimate}
      </h2>
      <p className="text-muted text-xs">{t.deliveryDemoDisclaimer}</p>
      <form onSubmit={onSubmit} className="space-y-2">
        <label
          htmlFor="postal-code"
          className="text-muted text-xs tracking-[0.16em] uppercase"
        >
          {t.deliveryPostcode}
        </label>
        <div className="flex gap-2">
          <input
            id="postal-code"
            name="postalCode"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            pattern="[0-9]{5}"
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
            aria-invalid={status === "error"}
            aria-describedby={message ? "postal-code-status" : "delivery-estimate-title"}
            placeholder="00100"
            className="border-border bg-linen min-h-11 w-full border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-secondary shrink-0 px-3 text-xs"
          >
            {status === "loading" ? t.sending : t.deliveryShowRates}
          </button>
        </div>
      </form>
      {message ? (
        <p
          id="postal-code-status"
          className={`text-sm ${status === "error" ? "text-sale" : "text-muted"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
      {rates.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {rates.map((rate) => {
            const labelKey = RATE_LABELS[rate.id];
            const label = labelKey ? t[labelKey] : rate.title;
            return (
              <li key={rate.id} className="flex justify-between gap-3">
                <span>{label}</span>
                <span>
                  {formatMoney(
                    moneyFromNumber(Number.parseFloat(rate.amount), rate.currency),
                    locale,
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
