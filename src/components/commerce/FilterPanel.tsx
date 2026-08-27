"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseProductQuery, queryToHref } from "@/lib/commerce/url-state";
import { CATEGORY_OPTIONS, SORT_OPTIONS, SPECIES_OPTIONS } from "@/lib/commerce/url-state";
import type { Facets, ProductQuery } from "@/lib/commerce/types";

interface FilterPanelProps {
  facets: Facets;
  idPrefix?: string;
}

function toggle(list: string[] | undefined, value: string): string[] {
  const current = list ?? [];
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}

export function FilterPanel({ facets, idPrefix = "filter" }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = parseProductQuery(Object.fromEntries(searchParams.entries()));

  function push(next: ProductQuery) {
    router.push(queryToHref(pathname, next));
  }

  const hasFilters = Boolean(
    current.species?.length ||
      current.category?.length ||
      current.brand?.length ||
      current.material?.length ||
      current.availability === "in-stock" ||
      current.priceMin !== undefined ||
      current.priceMax !== undefined ||
      (current.sort && current.sort !== "featured"),
  );

  return (
    <div className="space-y-8">
      {hasFilters ? (
        <button
          type="button"
          className="text-sm text-muted underline-offset-4 hover:underline"
          onClick={() => push({ query: current.query })}
        >
          Clear filters
        </button>
      ) : null}
      <fieldset>
        <legend className="text-xs tracking-[0.16em] text-muted uppercase">Sort</legend>
        <label htmlFor={`${idPrefix}-sort`} className="sr-only">
          Sort products
        </label>
        <select
          id={`${idPrefix}-sort`}
          className="mt-2 min-h-11 w-full border border-border bg-paper px-3 py-2 text-sm"
          value={current.sort ?? "featured"}
          onChange={(event) =>
            push({ ...current, sort: event.target.value as ProductQuery["sort"] })
          }
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {sortLabel(option)}
            </option>
          ))}
        </select>
      </fieldset>

      <FilterGroup
        legend="Species"
        options={SPECIES_OPTIONS.filter((value) => facets.species.includes(value)).map((value) => ({
          value,
          label: value === "dog" ? "Dogs" : "Cats",
        }))}
        selected={current.species ?? []}
        onToggle={(value) =>
          push({
            ...current,
            species: toggle(current.species, value) as ProductQuery["species"],
          })
        }
      />

      <FilterGroup
        legend="Category"
        options={CATEGORY_OPTIONS.filter((value) => facets.categories.includes(value)).map(
          (value) => ({ value, label: labelize(value) }),
        )}
        selected={current.category ?? []}
        onToggle={(value) =>
          push({
            ...current,
            category: toggle(current.category, value) as ProductQuery["category"],
          })
        }
      />

      <FilterGroup
        legend="Brand"
        options={facets.brands.map((value) => ({ value, label: value }))}
        selected={current.brand ?? []}
        onToggle={(value) => push({ ...current, brand: toggle(current.brand, value) })}
      />

      <FilterGroup
        legend="Material"
        options={facets.materials.map((value) => ({ value, label: value }))}
        selected={current.material ?? []}
        onToggle={(value) => push({ ...current, material: toggle(current.material, value) })}
      />

      <fieldset className="space-y-2">
        <legend className="text-xs tracking-[0.16em] text-muted uppercase">Price</legend>
        <div className="flex gap-2">
          <label className="flex-1 text-xs text-muted">
            Min
            <input
              type="number"
              min={facets.priceMin}
              max={facets.priceMax}
              defaultValue={current.priceMin ?? ""}
              className="mt-1 w-full border border-border bg-paper px-2 py-2 text-sm text-ink"
              onBlur={(event) => {
                const parsed = Number.parseFloat(event.target.value);
                push({
                  ...current,
                  priceMin: Number.isFinite(parsed) ? parsed : undefined,
                });
              }}
            />
          </label>
          <label className="flex-1 text-xs text-muted">
            Max
            <input
              type="number"
              min={facets.priceMin}
              max={facets.priceMax}
              defaultValue={current.priceMax ?? ""}
              className="mt-1 w-full border border-border bg-paper px-2 py-2 text-sm text-ink"
              onBlur={(event) => {
                const parsed = Number.parseFloat(event.target.value);
                push({
                  ...current,
                  priceMax: Number.isFinite(parsed) ? parsed : undefined,
                });
              }}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs tracking-[0.16em] text-muted uppercase">Availability</legend>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            id={`${idPrefix}-in-stock`}
            type="checkbox"
            checked={current.availability === "in-stock"}
            onChange={(event) =>
              push({ ...current, availability: event.target.checked ? "in-stock" : "all" })
            }
          />
          In stock
        </label>
      </fieldset>
    </div>
  );
}

function FilterGroup({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (options.length === 0) {
    return null;
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs tracking-[0.16em] text-muted uppercase">{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={() => onToggle(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

function labelize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function sortLabel(value: string): string {
  switch (value) {
    case "newest":
      return "Newest";
    case "price-asc":
      return "Price, low to high";
    case "price-desc":
      return "Price, high to low";
    default:
      return "Featured";
  }
}
