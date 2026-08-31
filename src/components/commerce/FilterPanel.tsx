"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseProductQuery, queryToHref } from "@/lib/commerce/url-state";
import {
  CATEGORY_OPTIONS,
  SORT_OPTIONS,
  SPECIES_OPTIONS,
} from "@/lib/commerce/url-state";
import type { Facets, ProductQuery } from "@/lib/commerce/types";
import { useLocale, useMessages } from "@/components/i18n/LocaleProvider";
import { stripLocalePrefix, withLocale } from "@/lib/i18n/path";
import type { Messages } from "@/lib/i18n/messages";

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
  const locale = useLocale();
  const t = useMessages();
  const current = parseProductQuery(Object.fromEntries(searchParams.entries()));

  function push(next: ProductQuery) {
    router.push(withLocale(queryToHref(stripLocalePrefix(pathname), next), locale));
  }

  const chips = selectedChips(current, t);
  const hasFilters = chips.length > 0;
  const showPrice =
    facets.priceMin !== facets.priceMax ||
    current.priceMin !== undefined ||
    current.priceMax !== undefined;

  return (
    <div className="space-y-8">
      {hasFilters ? (
        <div className="space-y-3">
          <button
            type="button"
            className="text-muted min-h-11 text-sm underline-offset-4 hover:underline"
            onClick={() =>
              push({
                query: current.query,
                sort: current.sort,
              })
            }
          >
            {t.clearAll}
          </button>
          <ul className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li key={chip.key}>
                <button
                  type="button"
                  className="border-border inline-flex min-h-9 items-center border px-2 text-xs"
                  onClick={() => push(chip.next)}
                >
                  {chip.label} ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <fieldset>
        <legend className="text-label text-muted">{t.sort}</legend>
        <label htmlFor={`${idPrefix}-sort`} className="sr-only">
          {t.sortProducts}
        </label>
        <select
          id={`${idPrefix}-sort`}
          className="border-border bg-paper mt-2 min-h-11 w-full border px-3 py-2 text-sm"
          value={current.sort ?? "featured"}
          onChange={(event) =>
            push({ ...current, sort: event.target.value as ProductQuery["sort"] })
          }
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {sortLabel(option, t)}
            </option>
          ))}
        </select>
      </fieldset>

      <FilterGroup
        legend={t.species}
        options={SPECIES_OPTIONS.filter((value) => facets.species.includes(value)).map(
          (value) => ({
            value,
            label: value === "dog" ? t.dogs : t.cats,
          }),
        )}
        selected={current.species ?? []}
        onToggle={(value) =>
          push({
            ...current,
            species: toggle(current.species, value) as ProductQuery["species"],
          })
        }
      />

      <FilterGroup
        legend={t.category}
        options={CATEGORY_OPTIONS.filter((value) =>
          facets.categories.includes(value),
        ).map((value) => ({ value, label: categoryLabel(value, t) }))}
        selected={current.category ?? []}
        onToggle={(value) =>
          push({
            ...current,
            category: toggle(current.category, value) as ProductQuery["category"],
          })
        }
      />

      <FilterGroup
        legend={t.brand}
        options={facets.brands.map((value) => ({ value, label: value }))}
        selected={current.brand ?? []}
        onToggle={(value) => push({ ...current, brand: toggle(current.brand, value) })}
      />

      <FilterGroup
        legend={t.material}
        options={facets.materials.map((value) => ({ value, label: value }))}
        selected={current.material ?? []}
        onToggle={(value) =>
          push({ ...current, material: toggle(current.material, value) })
        }
      />

      {showPrice ? (
        <fieldset className="space-y-2">
          <legend className="text-label text-muted">{t.price}</legend>
          <div className="flex gap-2">
            <label className="text-muted flex-1 text-xs">
              {t.min}
              <input
                type="number"
                min={facets.priceMin}
                max={facets.priceMax}
                defaultValue={current.priceMin ?? ""}
                className="border-border bg-paper text-ink mt-1 min-h-11 w-full border px-2 py-2 text-sm"
                onBlur={(event) => {
                  const parsed = Number.parseFloat(event.target.value);
                  push({
                    ...current,
                    priceMin: Number.isFinite(parsed) ? parsed : undefined,
                  });
                }}
              />
            </label>
            <label className="text-muted flex-1 text-xs">
              {t.max}
              <input
                type="number"
                min={facets.priceMin}
                max={facets.priceMax}
                defaultValue={current.priceMax ?? ""}
                className="border-border bg-paper text-ink mt-1 min-h-11 w-full border px-2 py-2 text-sm"
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
      ) : null}

      <fieldset className="space-y-2">
        <legend className="text-label text-muted">{t.availability}</legend>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            id={`${idPrefix}-in-stock`}
            type="checkbox"
            checked={current.availability === "in-stock"}
            onChange={(event) =>
              push({
                ...current,
                availability: event.target.checked ? "in-stock" : "all",
              })
            }
          />
          {t.inStock}
        </label>
      </fieldset>
    </div>
  );
}

function selectedChips(current: ProductQuery, t: Messages) {
  const chips: Array<{ key: string; label: string; next: ProductQuery }> = [];
  for (const value of current.species ?? []) {
    chips.push({
      key: `species-${value}`,
      label: value === "dog" ? t.dogs : t.cats,
      next: {
        ...current,
        species: (current.species ?? []).filter((item) => item !== value),
      },
    });
  }
  for (const value of current.category ?? []) {
    chips.push({
      key: `category-${value}`,
      label: categoryLabel(value, t),
      next: {
        ...current,
        category: (current.category ?? []).filter((item) => item !== value),
      },
    });
  }
  for (const value of current.brand ?? []) {
    chips.push({
      key: `brand-${value}`,
      label: value,
      next: {
        ...current,
        brand: (current.brand ?? []).filter((item) => item !== value),
      },
    });
  }
  for (const value of current.material ?? []) {
    chips.push({
      key: `material-${value}`,
      label: value,
      next: {
        ...current,
        material: (current.material ?? []).filter((item) => item !== value),
      },
    });
  }
  if (current.availability === "in-stock") {
    chips.push({
      key: "availability",
      label: t.inStock,
      next: { ...current, availability: "all" },
    });
  }
  return chips;
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
  if (options.length === 0 || (options.length <= 1 && selected.length === 0)) {
    return null;
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-label text-muted">{legend}</legend>
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

function categoryLabel(value: string, t: Messages): string {
  switch (value) {
    case "toys":
      return t.toys;
    case "harnesses":
      return t.harnesses;
    case "beds":
      return t.beds;
    case "feeding":
      return t.feeding;
    case "scratching":
      return t.scratching;
    default:
      return value;
  }
}

function sortLabel(value: string, t: Messages): string {
  switch (value) {
    case "newest":
      return t.sortNewest;
    case "price-asc":
      return t.sortPriceAsc;
    case "price-desc":
      return t.sortPriceDesc;
    default:
      return t.sortFeatured;
  }
}
