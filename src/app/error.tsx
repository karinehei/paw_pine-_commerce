"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="px-4">
      <ErrorState />
      <div className="pb-16 text-center">
        <button
          type="button"
          onClick={reset}
          className="text-sm text-muted underline-offset-4 hover:underline"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
