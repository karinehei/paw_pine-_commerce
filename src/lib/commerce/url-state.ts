import type {
  AvailabilityFilter,
  ProductCategory,
  ProductQuery,
  SortKey,
  Species,
} from "@/lib/commerce/types";

const SPECIES: Species[] = ["dog", "cat"];
const CATEGORIES: ProductCategory[] = [
  "toys",
  "harnesses",
  "beds",
  "feeding",
  "scratching",
];
const SORTS: SortKey[] = ["featured", "newest", "price-asc", "price-desc"];
const AVAILABILITY: Array<AvailabilityFilter | "all"> = [
  "in-stock",
  "out-of-stock",
  "all",
];

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function list(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(",") : value;
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberValue(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseProductQuery(searchParams: SearchParams): ProductQuery {
  const species = list(searchParams.species).filter((item): item is Species =>
    SPECIES.includes(item as Species),
  );
  const category = list(searchParams.category).filter((item): item is ProductCategory =>
    CATEGORIES.includes(item as ProductCategory),
  );
  const sortValue = first(searchParams.sort);
  const availabilityValue = first(searchParams.availability);

  return {
    query: first(searchParams.q)?.trim() || undefined,
    species: species.length > 0 ? species : undefined,
    category: category.length > 0 ? category : undefined,
    brand: list(searchParams.brand),
    material: list(searchParams.material),
    availability:
      availabilityValue && AVAILABILITY.includes(availabilityValue as AvailabilityFilter)
        ? (availabilityValue as AvailabilityFilter | "all")
        : undefined,
    priceMin: numberValue(first(searchParams.priceMin)),
    priceMax: numberValue(first(searchParams.priceMax)),
    sort: sortValue && SORTS.includes(sortValue as SortKey) ? (sortValue as SortKey) : undefined,
  };
}

export function serializeProductQuery(query: ProductQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.query) {
    params.set("q", query.query);
  }
  if (query.species?.length) {
    params.set("species", query.species.join(","));
  }
  if (query.category?.length) {
    params.set("category", query.category.join(","));
  }
  if (query.brand?.length) {
    params.set("brand", query.brand.join(","));
  }
  if (query.material?.length) {
    params.set("material", query.material.join(","));
  }
  if (query.availability && query.availability !== "all") {
    params.set("availability", query.availability);
  }
  if (query.priceMin !== undefined) {
    params.set("priceMin", String(query.priceMin));
  }
  if (query.priceMax !== undefined) {
    params.set("priceMax", String(query.priceMax));
  }
  if (query.sort && query.sort !== "featured") {
    params.set("sort", query.sort);
  }

  return params;
}

export function queryToHref(pathname: string, query: ProductQuery): string {
  const params = serializeProductQuery(query);
  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

export { SPECIES as SPECIES_OPTIONS, CATEGORIES as CATEGORY_OPTIONS, SORTS as SORT_OPTIONS };
