"use client";

import { cn } from "@/lib/format";
import type { ProductOption } from "@/lib/commerce/types";

interface VariantSelectorProps {
  options: ProductOption[];
  selected: Record<string, string>;
  onChange: (name: string, value: string) => void;
  unavailableValues?: Record<string, string[]>;
}

export function VariantSelector({
  options,
  selected,
  onChange,
  unavailableValues = {},
}: VariantSelectorProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <fieldset key={option.id} className="space-y-2">
          <legend className="text-sm text-muted">
            {option.name}
            {selected[option.name] ? (
              <span className="ml-2 text-ink">{selected[option.name]}</span>
            ) : null}
          </legend>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const unavailable = unavailableValues[option.name]?.includes(value);
              const checked = selected[option.name] === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange(option.name, value)}
                  aria-pressed={checked}
                  className={cn(
                    "min-w-12 border px-3 py-2 text-sm",
                    checked ? "border-ink bg-ink text-paper" : "border-border bg-paper text-ink",
                    unavailable && "opacity-40",
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
