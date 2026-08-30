"use client";

import { ErrorState } from "@/components/ui/ErrorState";
import { useMessages } from "@/components/i18n/LocaleProvider";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useMessages();
  return (
    <div className="px-4">
      <ErrorState />
      <div className="pb-16 text-center">
        <button
          type="button"
          onClick={reset}
          className="text-muted text-sm underline-offset-4 hover:underline"
        >
          {t.tryAgain}
        </button>
      </div>
    </div>
  );
}
