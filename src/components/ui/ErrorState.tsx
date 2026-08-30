"use client";

import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useMessages } from "@/components/i18n/LocaleProvider";

interface ErrorStateProps {
  title?: string;
  description?: string;
}

export function ErrorState({ title, description }: ErrorStateProps) {
  const t = useMessages();

  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <h1 className="font-display text-4xl">{title ?? t.errorTitle}</h1>
      <p className="text-muted mt-4">{description ?? t.errorDescription}</p>
      <LocaleLink href="/" className="btn-primary mt-8">
        {t.backToHome}
      </LocaleLink>
    </div>
  );
}
