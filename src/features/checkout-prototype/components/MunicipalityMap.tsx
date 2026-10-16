"use client";

import type { KeyboardEvent } from "react";

import { createMunicipalityMapRenderModel, type MunicipalityMapFeature } from "@/features/checkout-prototype/municipality-map";
import { GUATEMALA_MUNICIPALITIES } from "@/features/checkout-prototype/municipalities";

type MunicipalityMapProps = Readonly<{
  /** Only pass source-controlled geometry after provenance and reuse rights are approved. */
  features: readonly MunicipalityMapFeature[] | null;
  selectedCode: string;
  onSelect: (code: string) => void;
}>;

/** Isolated map renderer. Null geometry intentionally renders no geographic shapes. */
export function MunicipalityMap({ features, selectedCode, onSelect }: MunicipalityMapProps) {
  if (!features?.length) return null;

  const model = createMunicipalityMapRenderModel(features, selectedCode, GUATEMALA_MUNICIPALITIES);
  if (!model.features.length) return null;

  function selectWithKeyboard(event: KeyboardEvent<SVGPathElement>, code: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(code);
    }
  }

  return <section aria-label="Mapa interactivo de los municipios del departamento de Guatemala" className="relative overflow-hidden rounded-2xl border border-reva-border bg-[radial-gradient(ellipse_at_50%_18%,rgba(98,127,138,0.13),transparent_62%),linear-gradient(145deg,#f5f7f4,#e9efed)] p-4 sm:p-5">
    <div className="pointer-events-none absolute -right-8 -top-16 size-40 rounded-full border border-reva-brand-strong/10" />
    <div className="relative flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-reva-secondary">Departamento de Guatemala</p>
        <p aria-live="polite" className="mt-1 text-sm font-semibold text-reva-primary">{model.selectedLabel}</p>
      </div>
      {model.resetAvailable ? <button className="min-h-10 rounded-full px-3 text-xs font-semibold text-reva-brand-strong underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus motion-reduce:transition-none" onClick={() => onSelect("")} type="button">Ver departamento</button> : null}
    </div>
    <svg aria-hidden="false" className="relative mt-3 block h-auto max-h-[25rem] w-full overflow-visible" role="group" aria-label="Selecciona un municipio en el mapa" viewBox="0 0 1000 700">
      <g className="transition-transform duration-500 ease-out motion-reduce:transition-none" style={{ transform: model.transform, transformOrigin: "0 0" }}>
        <g aria-hidden="true" transform="translate(0 10)">
          {model.features.map((feature) => <path d={feature.path} fill="rgba(32,53,61,0.16)" key={feature.code} />)}
        </g>
        {model.features.map((feature) => <path
          aria-label={`Seleccionar ${feature.label}`}
          aria-pressed={feature.selected}
          className={`cursor-pointer outline-none transition-[fill,stroke,opacity] duration-200 focus-visible:stroke-reva-focus focus-visible:stroke-[8px] motion-reduce:transition-none ${feature.selected ? "fill-reva-brand-strong stroke-white stroke-[7px]" : "fill-white/90 stroke-reva-brand-strong/55 stroke-[3px] hover:fill-[#dce7e3]"}`}
          d={feature.path}
          key={feature.code}
          onClick={() => onSelect(feature.code)}
          onKeyDown={(event) => selectWithKeyboard(event, feature.code)}
          role="button"
          tabIndex={0}
        />)}
      </g>
    </svg>
    <div aria-label="Seleccionar municipio" className="relative mt-3 flex flex-wrap gap-2">
      {model.features.map((feature) => <button aria-pressed={feature.selected} className={`min-h-10 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus motion-reduce:transition-none ${feature.selected ? "border-reva-brand-strong bg-reva-brand-strong text-white" : "border-reva-border bg-white/80 text-reva-primary hover:border-reva-brand-strong/60"}`} key={feature.code} onClick={() => onSelect(feature.code)} type="button">{feature.label}</button>)}
      <span className="sr-only">{GUATEMALA_MUNICIPALITIES.length} municipios del departamento, cuando se suministre geometría aprobada.</span>
    </div>
  </section>;
}
