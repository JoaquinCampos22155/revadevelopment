"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { audiences } from "@/features/catalog/audiences";
import { colors } from "@/features/catalog/colors";
import { formatPriceCents } from "@/features/catalog/catalog-filter-params";
import { buildCatalogFilterHref } from "@/features/catalog/catalog-pagination";
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

function activeFilterCount(filters: PublishedCatalogFilters): number {
  return filters.audiences.length + filters.garmentTypes.length + filters.sizes.length + filters.colors.length
    + filters.conditionRatings.length + filters.brands.length + Number(filters.minPriceCents !== null) + Number(filters.maxPriceCents !== null);
}

function priceCentsToWholeQuetzales(value: string | null, fallback: number): number {
  if (!value || !/^\d+00$/.test(value)) return fallback;
  const wholeQuetzales = Number(value.slice(0, -2));
  if (!Number.isSafeInteger(wholeQuetzales) || wholeQuetzales < catalogPriceMinimum || wholeQuetzales > catalogPriceMaximum) return fallback;
  return wholeQuetzales;
}

function FilterGroup({ name, legend, options, selected, onToggle, idPrefix, collapsible = false }: Readonly<{
  legend: string;
  name: CheckboxFilterName;
  onToggle: (name: CheckboxFilterName, value: string, checked: boolean) => void;
  options: ReadonlyArray<Option>;
  selected: ReadonlyArray<string | number>;
  idPrefix: string;
  collapsible?: boolean;
}>) {
  const selectedValues = new Set(selected.map(String));
  if (!options.length) return null;

  const fields = <fieldset className="space-y-2">
    <legend className="sr-only">{legend}</legend>
    <div className="grid gap-2">
      {options.map((option) => {
        const id = `${idPrefix}-${name}-${option.value}`;
        return (
          <label className="flex min-h-11 items-center gap-3 text-sm text-reva-secondary" htmlFor={id} key={option.value}>
            <input
              checked={selectedValues.has(option.value)}
              className="size-4 shrink-0 rounded border-reva-brand text-reva-brand-strong focus:ring-reva-focus"
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
  </fieldset>;

  return collapsible
    ? <details className="border-b border-reva-border py-3" open={selected.length > 0}>
      <summary className="min-h-11 cursor-pointer content-center text-sm font-semibold text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus">{legend}{selected.length ? ` (${selected.length})` : ""}</summary>
      <div className="pt-2">{fields}</div>
    </details>
    : <div className="space-y-2"><p className="text-sm font-semibold text-reva-primary">{legend}</p>{fields}</div>;
}

function PriceRange({ initialMaximumPrice, initialMinimumPrice, onApply, idPrefix }: Readonly<{
  initialMaximumPrice: number;
  initialMinimumPrice: number;
  onApply: (minimum: number, maximum: number) => void;
  idPrefix: string;
}>) {
  const [minimumPrice, setMinimumPrice] = useState(initialMinimumPrice);
  const [maximumPrice, setMaximumPrice] = useState(initialMaximumPrice);
  const minimumId = `${idPrefix}-precio-minimo`;
  const maximumId = `${idPrefix}-precio-maximo`;

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-reva-primary">Precio (Q)</legend>
      <div aria-label={`Rango de precio: de Q${minimumPrice} a Q${maximumPrice}`} className="space-y-4 rounded-xl border border-reva-border bg-reva-surface p-3">
        <div className="flex items-center justify-between gap-3 text-sm font-medium text-reva-primary"><span>Q{minimumPrice}</span><span>Q{maximumPrice}</span></div>
        <p className="text-xs text-reva-secondary">El rango completo no limita el catálogo.</p>
        <div aria-hidden="true" className="relative h-2 rounded-full bg-reva-muted"><span className="absolute h-2 rounded-full bg-reva-brand" style={{ left: `${(minimumPrice / catalogPriceMaximum) * 100}%`, right: `${100 - (maximumPrice / catalogPriceMaximum) * 100}%` }} /></div>
        <label className="grid gap-1 text-sm text-reva-secondary" htmlFor={minimumId}><span>Mínimo</span><input aria-valuetext={`Q${minimumPrice}`} className="w-full accent-reva-brand-strong" id={minimumId} max={maximumPrice} min={catalogPriceMinimum} onChange={(event) => setMinimumPrice(Number(event.currentTarget.value))} step="1" type="range" value={minimumPrice} /></label>
        <label className="grid gap-1 text-sm text-reva-secondary" htmlFor={maximumId}><span>Máximo</span><input aria-valuetext={`Q${maximumPrice}`} className="w-full accent-reva-brand-strong" id={maximumId} max={catalogPriceMaximum} min={minimumPrice} onChange={(event) => setMaximumPrice(Number(event.currentTarget.value))} step="1" type="range" value={maximumPrice} /></label>
      </div>
      <button className="min-h-11 rounded-lg bg-reva-action px-4 text-sm font-semibold text-reva-on-action transition hover:bg-reva-action-hover focus:outline-none focus:ring-2 focus:ring-reva-focus focus:ring-offset-2 focus:ring-offset-reva-background" onClick={() => onApply(minimumPrice, maximumPrice)} type="button">Actualizar rango</button>
    </fieldset>
  );
}

/** Keeps desktop filters immediate and mobile selections temporary until applied. */
export function CatalogFilters({ facets, filters, hasActiveFilters }: CatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const lockScrollYRef = useRef(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(filters);
  const [isPending, startTransition] = useTransition();
  const currentCount = activeFilterCount(filters);
  const draftCount = activeFilterCount(draftFilters);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isMobileOpen && dialog && !dialog.open) dialog.showModal();
    if (!isMobileOpen && dialog?.open) dialog.close();
  }, [isMobileOpen]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const root = document.documentElement;
    const body = document.body;
    const scrollY = lockScrollYRef.current;
    const originalOverflow = root.style.overflow;
    const originalGutter = root.style.scrollbarGutter;
    const originalBodyPosition = body.style.position;
    const originalBodyTop = body.style.top;
    const originalBodyLeft = body.style.left;
    const originalBodyRight = body.style.right;
    const originalBodyWidth = body.style.width;
    const originalBodyOverflow = body.style.overflow;
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      root.style.overflow = originalOverflow;
      root.style.scrollbarGutter = originalGutter;
      body.style.position = originalBodyPosition;
      body.style.top = originalBodyTop;
      body.style.left = originalBodyLeft;
      body.style.right = originalBodyRight;
      body.style.width = originalBodyWidth;
      body.style.overflow = originalBodyOverflow;
      const originalScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      root.style.scrollBehavior = originalScrollBehavior;
    };
  }, [isMobileOpen]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeForDesktop = () => { if (desktop.matches) setIsMobileOpen(false); };
    desktop.addEventListener("change", closeForDesktop);
    return () => desktop.removeEventListener("change", closeForDesktop);
  }, []);

  function navigate(nextFilters: PublishedCatalogFilters) {
    const href = buildCatalogFilterHref(new URLSearchParams(searchParams.toString()), filtersToSearchParams(nextFilters));
    startTransition(() => router.push(href, { scroll: false }));
  }

  function toggleFilter(current: PublishedCatalogFilters, name: CheckboxFilterName, value: string, checked: boolean): PublishedCatalogFilters {
    const fieldByName = { audiencia: "audiences", tipo: "garmentTypes", talla: "sizes", color: "colors", condicion: "conditionRatings", marca: "brands" } as const;
    const field = fieldByName[name];
    const values = current[field].map(String).filter((currentValue) => currentValue !== value);
    if (checked) values.push(value);
    return { ...current, [field]: values } as PublishedCatalogFilters;
  }

  function handleDesktopToggle(name: CheckboxFilterName, value: string, checked: boolean) {
    navigate(toggleFilter(filters, name, value, checked));
  }

  function handleDesktopPriceApply(minimumPrice: number, maximumPrice: number) {
    const isDefaultRange = minimumPrice === catalogPriceMinimum && maximumPrice === catalogPriceMaximum;
    navigate({ ...filters, minPriceCents: isDefaultRange || minimumPrice === 0 ? null : String(minimumPrice * 100), maxPriceCents: isDefaultRange ? null : String(maximumPrice * 100) });
  }

  function handleDraftPriceApply(minimumPrice: number, maximumPrice: number) {
    const isDefaultRange = minimumPrice === catalogPriceMinimum && maximumPrice === catalogPriceMaximum;
    setDraftFilters((current) => ({ ...current, minPriceCents: isDefaultRange || minimumPrice === 0 ? null : String(minimumPrice * 100), maxPriceCents: isDefaultRange ? null : String(maximumPrice * 100) }));
  }

  function createGroups(selected: PublishedCatalogFilters, onToggle: (name: CheckboxFilterName, value: string, checked: boolean) => void, collapsible: boolean, idPrefix: string) {
    return <>
      <FilterGroup collapsible={collapsible} idPrefix={idPrefix} legend="Público" name="audiencia" onToggle={onToggle} options={representedOptions(audiences, facets.audiences)} selected={selected.audiences} />
      <FilterGroup collapsible={collapsible} idPrefix={idPrefix} legend="Tipo de prenda" name="tipo" onToggle={onToggle} options={representedOptions(garmentTypes, facets.garmentTypes)} selected={selected.garmentTypes} />
      <FilterGroup collapsible={collapsible} idPrefix={idPrefix} legend="Talla indicada" name="talla" onToggle={onToggle} options={representedOptions(productSizes, facets.sizes)} selected={selected.sizes} />
      <FilterGroup collapsible={collapsible} idPrefix={idPrefix} legend="Color" name="color" onToggle={onToggle} options={representedOptions(colors, facets.colors)} selected={selected.colors} />
      <FilterGroup collapsible={collapsible} idPrefix={idPrefix} legend="Condición" name="condicion" onToggle={onToggle} options={conditionOrder.filter((rating) => facets.conditionRatings.includes(rating)).map((rating) => ({ label: conditionLabels[rating], value: String(rating) }))} selected={selected.conditionRatings} />
      <FilterGroup collapsible={collapsible} idPrefix={idPrefix} legend="Marca" name="marca" onToggle={onToggle} options={facets.brands.map((brand) => ({ label: brand, value: brand }))} selected={selected.brands} />
    </>;
  }

  const desktopGroups = createGroups(filters, handleDesktopToggle, false, "desktop");
  const mobileGroups = createGroups(draftFilters, (name, value, checked) => setDraftFilters((current) => toggleFilter(current, name, value, checked)), true, "mobile");
  const desktopPriceKey = `${filters.minPriceCents ?? "default"}-${filters.maxPriceCents ?? "default"}`;
  const mobilePriceKey = `${draftFilters.minPriceCents ?? "default"}-${draftFilters.maxPriceCents ?? "default"}`;

  return (
    <aside className="lg:min-w-0" aria-label="Filtros del catálogo">
      <button
        aria-controls="catalog-mobile-filter-dialog"
        aria-expanded={isMobileOpen}
        aria-label={currentCount ? `Abrir filtros del catálogo, ${currentCount} activos` : "Abrir filtros del catálogo"}
        className="flex min-h-12 w-full items-center justify-between rounded-xl border border-reva-border bg-reva-muted px-5 text-left text-sm font-semibold text-reva-primary focus:outline-none focus:ring-2 focus:ring-reva-focus focus:ring-offset-2 focus:ring-offset-reva-background lg:hidden"
        onClick={() => { lockScrollYRef.current = window.scrollY; setDraftFilters(filters); setIsMobileOpen(true); }}
        ref={triggerRef}
        type="button"
      >
        <span>Filtros{currentCount ? ` (${currentCount})` : ""}</span><span aria-hidden="true">⌄</span>
      </button>

      <dialog
        aria-labelledby="catalog-mobile-filter-heading"
        aria-modal="true"
        className="reva-catalog-filter-dialog fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 text-reva-primary lg:hidden"
        id="catalog-mobile-filter-dialog"
        onClick={(event) => { if (event.target === dialogRef.current) setIsMobileOpen(false); }}
        onKeyDown={(event) => {
          if (event.key !== "Tab" || !dialogRef.current) return;
          const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), summary, a[href], [tabindex]:not([tabindex=\"-1\"])")]
            .filter((element) => element.getClientRects().length > 0);
          const first = focusable[0];
          const last = focusable.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClose={() => { setIsMobileOpen(false); triggerRef.current?.focus(); }}
        ref={dialogRef}
      >
        <section className="reva-catalog-filter-panel mx-auto mt-auto flex h-[min(88dvh,52rem)] w-screen max-w-[34rem] flex-col overflow-hidden rounded-t-2xl bg-reva-background shadow-2xl" aria-describedby="catalog-mobile-filter-description">
          <header className="flex items-center justify-between gap-4 border-b border-reva-border bg-reva-muted px-5 py-4">
            <div><h2 className="font-serif text-2xl text-reva-primary" id="catalog-mobile-filter-heading">Filtra las prendas</h2><p className="mt-1 text-sm text-reva-secondary" id="catalog-mobile-filter-description">Selecciona lo que buscas y aplica los cambios.</p></div>
            <button aria-label="Cerrar filtros" className="grid size-11 shrink-0 place-items-center rounded-full border border-reva-border text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" onClick={() => setIsMobileOpen(false)} type="button">×</button>
          </header>
          <div aria-busy={isPending} className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
            <p aria-live="polite" className="sr-only">{draftCount} filtros seleccionados</p>
            <div className="divide-y divide-reva-border">{mobileGroups}</div>
            <details className="border-b border-reva-border py-3" open={draftFilters.minPriceCents !== null || draftFilters.maxPriceCents !== null}>
              <summary className="min-h-11 cursor-pointer content-center text-sm font-semibold text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus">Precio{draftFilters.minPriceCents !== null || draftFilters.maxPriceCents !== null ? " (1)" : ""}</summary>
              <div className="pb-3 pt-2"><PriceRange idPrefix="mobile" initialMaximumPrice={priceCentsToWholeQuetzales(draftFilters.maxPriceCents, catalogPriceMaximum)} initialMinimumPrice={priceCentsToWholeQuetzales(draftFilters.minPriceCents, catalogPriceMinimum)} key={mobilePriceKey} onApply={handleDraftPriceApply} /></div>
            </details>
          </div>
          <footer className="grid grid-cols-2 gap-3 border-t border-reva-border bg-reva-surface px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            <button className="min-h-12 rounded-lg border border-reva-border px-4 text-sm font-semibold text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" onClick={() => setDraftFilters({ audiences: [], brands: [], colors: [], conditionRatings: [], garmentTypes: [], maxPriceCents: null, minPriceCents: null, sizes: [] })} type="button">Limpiar</button>
            <button className="min-h-12 rounded-lg bg-reva-action px-4 text-sm font-semibold text-reva-on-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2" onClick={() => { navigate(draftFilters); setIsMobileOpen(false); }} type="button">Aplicar filtros</button>
          </footer>
        </section>
      </dialog>

      <form action="/catalogo" className="hidden rounded-xl border border-reva-border bg-reva-muted p-4 sm:p-5 lg:block" method="get">
        <div className="flex items-center justify-between gap-3"><h2 className="font-serif text-xl tracking-tight text-reva-primary">Filtros</h2>{hasActiveFilters ? <Link className="text-sm font-medium text-reva-action underline underline-offset-4" href={buildCatalogFilterHref(new URLSearchParams(searchParams.toString()), new URLSearchParams())}>Limpiar filtros</Link> : null}</div>
        <p aria-live="polite" className="mt-2 text-sm text-reva-secondary">{isPending ? "Actualizando resultados…" : "Los filtros de selección se aplican automáticamente."}</p>
        <fieldset aria-busy={isPending} className="mt-5 space-y-5" disabled={isPending}>
          {desktopGroups}
          <PriceRange idPrefix="desktop" initialMaximumPrice={priceCentsToWholeQuetzales(filters.maxPriceCents, catalogPriceMaximum)} initialMinimumPrice={priceCentsToWholeQuetzales(filters.minPriceCents, catalogPriceMinimum)} key={desktopPriceKey} onApply={handleDesktopPriceApply} />
          <noscript><button className="min-h-10 rounded-lg bg-reva-action px-4 text-sm font-semibold text-reva-on-action" type="submit">Aplicar filtros</button></noscript>
        </fieldset>
      </form>
    </aside>
  );
}
