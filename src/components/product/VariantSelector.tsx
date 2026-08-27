"use client";

import { cn } from "@/lib/format";
import type { OptionValueState } from "@/lib/commerce/variants";
import type { ProductOption } from "@/lib/commerce/types";

interface VariantSelectorProps {
  options: ProductOption[];
  selected: Record<string, string>;
  onChange: (name: string, value: string) => void;
  valueStates?: Record<string, Record<string, OptionValueState>>;
}

export function VariantSelector({
  options,
  selected,
  onChange,
  valueStates = {},
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
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={option.name}>
            {option.values.map((value) => {
              const state = valueStates[option.name]?.[value] ?? "available";
              const checked = selected[option.name] === value;
              const invalid = state === "invalid";
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => {
                    if (!invalid) {
                      onChange(option.name, value);
                    }
                  }}
                  disabled={invalid}
                  aria-label={`${option.name} ${value}${
                    state === "out_of_stock" ? ", out of stock" : invalid ? ", unavailable" : ""
                  }`}
                  className={cn(
                    "min-h-11 min-w-11 border px-3 py-2 text-sm",
                    checked ? "border-ink bg-ink text-paper" : "border-border bg-paper text-ink",
                    state === "out_of_stock" && "opacity-50",
                    invalid && "cursor-not-allowed line-through opacity-30",
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
