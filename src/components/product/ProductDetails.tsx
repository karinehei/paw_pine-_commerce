"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useMessages } from "@/components/i18n/LocaleProvider";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import type { Product } from "@/lib/commerce/types";

export function ProductDetails({ product }: { product: Product }) {
  const t = useMessages();
  const items: Array<{ id: string; title: string; body: ReactNode }> = [
    { id: "materials", title: t.materials, body: product.material },
    { id: "dimensions", title: t.dimensions, body: product.dimensions },
    { id: "care", title: t.care, body: product.care },
    {
      id: "shipping",
      title: t.shippingAndReturns,
      body: (
        <>
          {t.shippingReturnsBlurb(FREE_SHIPPING_THRESHOLD)}{" "}
          <LocaleLink href="/shipping" className="underline-offset-4 hover:underline">
            {t.shipping}
          </LocaleLink>{" "}
          {t.andWord}{" "}
          <LocaleLink href="/returns" className="underline-offset-4 hover:underline">
            {t.returns}
          </LocaleLink>
          .
        </>
      ),
    },
  ];

  return (
    <div className="mt-10">
      {product.features.length > 0 ? (
        <ul className="mb-8 grid gap-3 sm:grid-cols-3">
          {product.features.slice(0, 3).map((feature) => (
            <li key={feature} className="border-border bg-paper border px-4 py-3 text-sm">
              {feature}
            </li>
          ))}
        </ul>
      ) : null}
      <dl className="border-border hidden space-y-4 border-t pt-8 text-sm md:block">
        {items.map((item) => (
          <div key={item.id}>
            <dt className="text-label text-muted">{item.title}</dt>
            <dd className="text-muted mt-1">{item.body}</dd>
          </div>
        ))}
      </dl>
      <div className="border-border divide-border divide-y border-y md:hidden">
        {items.map((item) => (
          <Accordion key={item.id} title={item.title}>
            {item.body}
          </Accordion>
        ))}
      </div>
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-h-11 w-full items-center justify-between py-3 text-left text-sm tracking-[0.12em] uppercase"
          onClick={() => setOpen((value) => !value)}
        >
          {title}
          <span aria-hidden="true">{open ? "–" : "+"}</span>
        </button>
      </h3>
      {open ? (
        <div id={panelId} className="text-muted pb-4 text-sm">
          {children}
        </div>
      ) : null}
    </div>
  );
}
