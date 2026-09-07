"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { audiences } from "@/features/catalog/audiences";
import { colors } from "@/features/catalog/colors";
import { formatPriceCents } from "@/features/catalog/catalog-filter-params";
import { conditionLabels, type ConditionRating } from "@/features/catalog/condition";
import { garmentTypes } from "@/features/catalog/garment-types";
import type { PublishedCatalogFacets, PublishedCatalogFilters } from "@/features/catalog/server/catalog-filter.types";
import { productSizes } from "@/features/catalog/sizes";

type CatalogFiltersProps = Readonly<{
  facets: PublishedCatalogFacets;
  filters: PublishedCatalogFilters;
  hasActiveFilters: boolean;
}>;

type CheckboxFilterName = "audiencia" | "tipo" | "talla" | "color" | "condicion" | "marca";
type Option = Readonly<{ label: string; value: string }>;

const conditionOrder: ReadonlyArray<ConditionRating> = [4, 3, 2, 1];
const catalogPriceMinimum = 0;
const catalogPriceMaximum = 1000;

function representedOptions(values: ReadonlyArray<Option>, represented: ReadonlyArray<string | number>): ReadonlyArray<Option> {
  const available = new Set(represented.map(String));
  return values.filter((value) => available.has(value.value));
}

function filtersToSearchParams(filters: PublishedCatalogFilters): URLSearchParams {
  const params = new URLSearchParams();
  const appendAll = (name: CheckboxFilterName, values: ReadonlyArray<string | number>) => values.forEach((value) => params.append(name, String(value)));

  appendAll("audiencia", filters.audiences);
  appendAll("tipo", filters.garmentTypes);
  appendAll("talla", filters.sizes);
  appendAll("color", filters.colors);
  appendAll("condicion", filters.conditionRatings);
  appendAll("marca", filters.brands);

  const minimum = formatPriceCents(filters.minPriceCents);
  const maximum = formatPriceCents(filters.maxPriceCents);
  if (minimum) params.set("precio_min", minimum);
  if (maximum) params.set("precio_max", maximum);

  return params;
}

function toCatalogHref(params: URLSearchParams): string {
  params.delete("pagina");
  const query = params.toString();
  return query ? `/catalogo?${query}` : "/catalogo";
}

function priceCentsToWholeQuetzales(value: string | null, fallback: number): number {
  if (!value || !/^\d+00$/.test(value)) return fallback;
  const wholeQuetzales = Number(value.slice(0, -2));
  if (!Number.isSafeInteger(wholeQuetzales) || wholeQuetzales < catalogPriceMinimum || wholeQuetzales > catalogPriceMaximum) return fallback;
  return wholeQuetzales;
}

function FilterGroup({ name, legend, options, selected, onToggle }: Readonly<{
  legend: string;
  name: CheckboxFilterName;
  onToggle: (name: CheckboxFilterName, value: string, checked: boolean) => void;
  options: ReadonlyArray<Option>;
  selected: ReadonlyArray<string | number>;
}>) {
  const selectedValues = new Set(selected.map(String));
  if (!options.length) return null;

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-reva-primary">{legend}</legend>
      <div className="grid gap-2">
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          return (
            <label className="flex min-h-10 items-center gap-2.5 text-sm text-reva-secondary" htmlFor={id} key={option.value}>
              <input
                checked={selectedValues.has(option.value)}
                className="size-4 rounded border-reva-brand text-reva-brand-strong focus:ring-reva-focus"
                id={id}
                name={name}
                onChange={(event) => onToggle(name, option.value, event.currentTarget.checked)}
                type="checkbox"
                value={option.value}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function PriceRange({ initialMaximumPrice, initialMinimumPrice, onApply }: Readonly<{
  initialMaximumPrice: number;
  initialMinimumPrice: number;
  onApply: (minimum: number, maximum: number) => void;
}>) {
  const [minimumPrice, setMinimumPrice] = useState(initialMinimumPrice);
  const [maximumPrice, setMaximumPrice] = useState(initialMaximumPrice);

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-reva-primary">Precio (Q)</legend>
      <div aria-label={`Rango de precio: de Q${minimumPrice} a Q${maximumPrice}`} className="space-y-4 rounded-xl border border-reva-border bg-reva-surface p-3">
        <div className="flex items-center justify-between gap-3 text-sm font-medium text-reva-primary">
          <span>Q{minimumPrice}</span>
          <span>Q{maximumPrice}</span>
        </div>
        <p className="text-xs text-reva-secondary">El rango completo no limita el catálogo.</p>
        <div aria-hidden="true" className="relative h-2 rounded-full bg-reva-muted">
          <span className="absolute h-2 rounded-full bg-reva-brand" style={{ left: `${(minimumPrice / catalogPriceMaximum) * 100}%`, right: `${100 - (maximumPrice / catalogPriceMaximum) * 100}%` }} />
        </div>
        <label className="grid gap-1 text-sm text-reva-secondary" htmlFor="precio-minimo">
          <span>Mínimo</span>
          <input aria-valuetext={`Q${minimumPrice}`} className="w-full accent-reva-brand-strong" id="precio-minimo" max={maximumPrice} min={catalogPriceMinimum} onChange={(event) => setMinimumPrice(Number(event.currentTarget.value))} step="1" type="range" value={minimumPrice} />
        </label>
        <label className="grid gap-1 text-sm text-reva-secondary" htmlFor="precio-maximo">
          <span>Máximo</span>
          <input aria-valuetext={`Q${maximumPrice}`} className="w-full accent-reva-brand-strong" id="precio-maximo" max={catalogPriceMaximum} min={minimumPrice} onChange={(event) => setMaximumPrice(Number(event.currentTarget.value))} step="1" type="range" value={maximumPrice} />
        </label>
      </div>
      <button className="min-h-10 rounded-lg bg-reva-action px-4 text-sm font-semibold text-reva-on-action transition hover:bg-reva-action-hover focus:outline-none focus:ring-2 focus:ring-reva-focus focus:ring-offset-2 focus:ring-offset-reva-background" id="actualizar-precio" onClick={() => onApply(minimumPrice, maximumPrice)} type="button">Actualizar rango</button>
    </fieldset>
  );
}

/** Keeps URL search parameters as the only filter state while preserving server-side Product queries. */
export function CatalogFilters({ facets, filters, hasActiveFilters }: CatalogFiltersProps) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const activeCount = filters.audiences.length + filters.garmentTypes.length + filters.sizes.length + filters.colors.length + filters.conditionRatings.length + filters.brands.length + Number(filters.minPriceCents !== null) + Number(filters.maxPriceCents !== null);

  function navigate(params: URLSearchParams) {
    setIsMobileOpen(false);
    startTransition(() => {
      router.push(toCatalogHref(params), { scroll: false });
    });
  }

  function handleToggle(name: CheckboxFilterName, value: string, checked: boolean) {
    const params = filtersToSearchParams(filters);
    const values = params.getAll(name).filter((currentValue) => currentValue !== value);
    if (checked) values.push(value);
    params.delete(name);
    values.forEach((currentValue) => params.append(name, currentValue));
    navigate(params);
  }

  function handlePriceApply(minimumPrice: number, maximumPrice: number) {
    const params = filtersToSearchParams(filters);
    params.delete("precio_min");
    params.delete("precio_max");
    const isDefaultRange = minimumPrice === catalogPriceMinimum && maximumPrice === catalogPriceMaximum;
    if (!isDefaultRange) {
      if (minimumPrice > catalogPriceMinimum) params.set("precio_min", String(minimumPrice));
      params.set("precio_max", String(maximumPrice));
    }
    navigate(params);
  }

  const groups = (
    <>
      <FilterGroup legend="Público" name="audiencia" onToggle={handleToggle} options={representedOptions(audiences, facets.audiences)} selected={filters.audiences} />
      <FilterGroup legend="Tipo de prenda" name="tipo" onToggle={handleToggle} options={representedOptions(garmentTypes, facets.garmentTypes)} selected={filters.garmentTypes} />
      <FilterGroup legend="Talla indicada" name="talla" onToggle={handleToggle} options={representedOptions(productSizes, facets.sizes)} selected={filters.sizes} />
      <FilterGroup legend="Color" name="color" onToggle={handleToggle} options={representedOptions(colors, facets.colors)} selected={filters.colors} />
      <FilterGroup legend="Condición" name="condicion" onToggle={handleToggle} options={conditionOrder.filter((rating) => facets.conditionRatings.includes(rating)).map((rating) => ({ label: conditionLabels[rating], value: String(rating) }))} selected={filters.conditionRatings} />
      <FilterGroup legend="Marca" name="marca" onToggle={handleToggle} options={facets.brands.map((brand) => ({ label: brand, value: brand }))} selected={filters.brands} />
    </>
  );

  return (
    <aside className="lg:min-w-0" aria-label="Filtros del catálogo">
      <button
        aria-controls="catalog-filters"
        aria-expanded={isMobileOpen}
        className="flex min-h-12 w-full items-center justify-between rounded-xl border border-reva-border bg-reva-muted px-5 text-left text-sm font-semibold text-reva-primary focus:outline-none focus:ring-2 focus:ring-reva-focus focus:ring-offset-2 focus:ring-offset-reva-background lg:hidden"
        onClick={() => setIsMobileOpen((current) => !current)}
        type="button"
      >
        <span>Filtros{activeCount ? ` (${activeCount})` : ""}</span>
        <span aria-hidden="true">{isMobileOpen ? "−" : "+"}</span>
      </button>
      <form
        aria-busy={isPending}
        action="/catalogo"
        className={`${isMobileOpen ? "mt-3 block" : "hidden"} rounded-xl border border-reva-border bg-reva-muted p-4 sm:p-5 lg:mt-0 lg:block`}
        id="catalog-filters"
        method="get"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-xl tracking-tight text-reva-primary">Filtros</h2>
          {hasActiveFilters ? <Link className="text-sm font-medium text-reva-action underline underline-offset-4" href="/catalogo">Limpiar filtros</Link> : null}
        </div>
        <p aria-live="polite" className="mt-2 text-sm text-reva-secondary">{isPending ? "Actualizando resultados…" : "Los filtros de selección se aplican automáticamente."}</p>
        <fieldset className="mt-5 space-y-5" disabled={isPending}>
          {groups}
          <PriceRange initialMaximumPrice={priceCentsToWholeQuetzales(filters.maxPriceCents, catalogPriceMaximum)} initialMinimumPrice={priceCentsToWholeQuetzales(filters.minPriceCents, catalogPriceMinimum)} key={`${filters.minPriceCents ?? "default"}-${filters.maxPriceCents ?? "default"}`} onApply={handlePriceApply} />
          <noscript><button className="min-h-10 rounded-lg bg-reva-action px-4 text-sm font-semibold text-reva-on-action" type="submit">Aplicar filtros</button></noscript>
        </fieldset>
      </form>
    </aside>
  );
}
