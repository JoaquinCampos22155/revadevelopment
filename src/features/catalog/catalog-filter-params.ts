import { isAudience, type Audience } from "@/features/catalog/audiences";
import { isColor, type Color } from "@/features/catalog/colors";
import { isConditionRating, type ConditionRating } from "@/features/catalog/condition";
import { isGarmentType, type GarmentType } from "@/features/catalog/garment-types";
import { isProductSize, type ProductSize } from "@/features/catalog/sizes";
import type { PublishedCatalogFacets, PublishedCatalogFilters, PublishedCatalogQuery } from "@/features/catalog/server/catalog-filter.types";

export type CatalogSearchParams = Readonly<Record<string, string | ReadonlyArray<string> | undefined>>;

const pageSize = 24;
const maximumPage = 10_000;
const maximumPriceIntegerDigits = 10;

function valuesFor(params: CatalogSearchParams, name: string): ReadonlyArray<string> {
  const value = params[name];
  if (typeof value === "string") return [value];
  return value ?? [];
}

/** Preserves the former public jeans filter as the approved pantalones category. */
function garmentTypeValues(params: CatalogSearchParams): ReadonlyArray<string> {
  return valuesFor(params, "tipo").map((value) => value === "jeans" ? "pantalones" : value);
}

function uniqueRepresentedValues<T extends string>(
  values: ReadonlyArray<string>,
  isValid: (value: string) => value is T,
  available: ReadonlyArray<T>,
): ReadonlyArray<T> {
  const allowed = new Set(available);
  const accepted = new Set<T>();
  for (const value of values.slice(0, available.length)) {
    if (isValid(value) && allowed.has(value)) accepted.add(value);
  }

  return [...accepted];
}

function uniqueKnownBrands(values: ReadonlyArray<string>, availableBrands: ReadonlyArray<string>): ReadonlyArray<string> {
  const allowed = new Set(availableBrands);
  const accepted = new Set<string>();
  for (const value of values.slice(0, availableBrands.length)) {
    if (accepted.size >= availableBrands.length) break;
    if (allowed.has(value)) accepted.add(value);
  }

  return [...accepted];
}

function toPriceCents(value: string): string | null {
  const match = new RegExp(`^(0|[1-9]\\d{0,${maximumPriceIntegerDigits - 1}})(?:\\.(\\d{1,2}))?$`).exec(value);
  if (!match) return null;

  const [, whole, fraction = ""] = match;
  return `${whole}${fraction.padEnd(2, "0")}`.replace(/^0+(?=\d)/, "");
}

function singlePriceBound(params: CatalogSearchParams, name: string): string | null {
  const distinct = [...new Set(valuesFor(params, name))];
  if (distinct.length !== 1) return null;
  return toPriceCents(distinct[0]);
}

function compareCents(left: string, right: string): number {
  if (left.length !== right.length) return left.length - right.length;
  return left.localeCompare(right, "en");
}

function pageFrom(params: CatalogSearchParams): number {
  const distinct = [...new Set(valuesFor(params, "pagina"))];
  if (distinct.length !== 1 || !/^[1-9]\d*$/.test(distinct[0])) return 1;
  const page = Number(distinct[0]);
  return Number.isSafeInteger(page) && page <= maximumPage ? page : 1;
}

function hasFilters(filters: PublishedCatalogFilters): boolean {
  return filters.audiences.length > 0
    || filters.brands.length > 0
    || filters.colors.length > 0
    || filters.conditionRatings.length > 0
    || filters.garmentTypes.length > 0
    || filters.maxPriceCents !== null
    || filters.minPriceCents !== null
    || filters.sizes.length > 0;
}

export type ParsedCatalogQuery = Readonly<{
  hasActiveFilters: boolean;
  query: PublishedCatalogQuery;
}>;

/** Converts untrusted public URL values into REVA's typed catalog-query contract. */
export function parseCatalogSearchParams(
  params: CatalogSearchParams,
  facets: PublishedCatalogFacets,
): ParsedCatalogQuery {
  let minPriceCents = singlePriceBound(params, "precio_min");
  let maxPriceCents = singlePriceBound(params, "precio_max");
  if (minPriceCents !== null && maxPriceCents !== null && compareCents(minPriceCents, maxPriceCents) > 0) {
    minPriceCents = null;
    maxPriceCents = null;
  }

  const filters: PublishedCatalogFilters = {
    audiences: uniqueRepresentedValues<Audience>(valuesFor(params, "audiencia"), isAudience, facets.audiences),
    brands: uniqueKnownBrands(valuesFor(params, "marca"), facets.brands),
    colors: uniqueRepresentedValues<Color>(valuesFor(params, "color"), isColor, facets.colors),
    conditionRatings: uniqueRepresentedValues<`${ConditionRating}`>(valuesFor(params, "condicion"), isConditionRating, facets.conditionRatings.map(String) as ReadonlyArray<`${ConditionRating}`>).map((value) => Number(value) as ConditionRating),
    garmentTypes: uniqueRepresentedValues<GarmentType>(garmentTypeValues(params), isGarmentType, facets.garmentTypes),
    maxPriceCents,
    minPriceCents,
    sizes: uniqueRepresentedValues<ProductSize>(valuesFor(params, "talla"), isProductSize, facets.sizes),
  };

  return {
    hasActiveFilters: hasFilters(filters),
    query: { filters, page: pageFrom(params), pageSize },
  };
}

/** Formats an exact integer-cent value for the native public price controls. */
export function formatPriceCents(cents: string | null): string {
  if (cents === null) return "";
  const normalized = cents.padStart(3, "0");
  const whole = normalized.slice(0, -2);
  const fraction = normalized.slice(-2);
  return `${whole}.${fraction}`;
}
