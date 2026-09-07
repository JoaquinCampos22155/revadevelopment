"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { audiences } from "@/features/catalog/audiences";
import { colorSwatches, colors, isColor } from "@/features/catalog/colors";
import { conditionLabels } from "@/features/catalog/condition";
import { garmentTypes } from "@/features/catalog/garment-types";
import { productSizes } from "@/features/catalog/sizes";
import { createProductDraftAction, saveProductDraftAction } from "@/features/product-manager/server/product-draft.actions";
import { initialProductDraftFormState } from "@/features/product-manager/product-draft-form-state";
import type { ProductDraft } from "@/features/product-manager/server/product-draft.types";

type MeasurementRow = Readonly<{ id: string; name: string; value: string }>;
type ProductDraftFormProps = Readonly<{ draft?: ProductDraft; today: string }>;

const fieldClass = "min-h-11 w-full rounded-lg border border-reva-border bg-reva-surface px-3 font-normal text-reva-primary outline-none transition focus:border-reva-brand focus:ring-2 focus:ring-reva-focus/25";
const fieldLabelClass = "space-y-2 text-sm font-medium text-reva-primary";
const sectionClass = "space-y-5 rounded-2xl border border-reva-border bg-reva-surface p-5 sm:p-6";

function getMeasurementRows(draft: ProductDraft | undefined): MeasurementRow[] {
  if (!draft?.measurements) return [];
  return Object.entries(draft.measurements).map(([name, value], index) => ({ id: `${name}-${index}`, name, value: value.replace(/\s*cm$/i, "") }));
}

/** Keeps draft input interaction local; persistence and authorization remain server-bound. */
export function ProductDraftForm({ draft, today }: ProductDraftFormProps) {
  const isEditing = Boolean(draft);
  const hasLegacyColor = Boolean(draft?.color && !isColor(draft.color));
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(isEditing ? saveProductDraftAction : createProductDraftAction, initialProductDraftFormState);
  const [sourceType, setSourceType] = useState(draft?.sourceType ?? "sell");
  const [audience, setAudience] = useState(draft?.audience ?? "");
  const [garmentType, setGarmentType] = useState(draft?.garmentType ?? "");
  const [color, setColor] = useState(draft?.color ?? "");
  const [sizeLabel, setSizeLabel] = useState(draft?.sizeLabel ?? "");
  const [conditionRating, setConditionRating] = useState(draft?.conditionRating?.toString() ?? "");
  const [measurements, setMeasurements] = useState<MeasurementRow[]>(() => getMeasurementRows(draft));

  useEffect(() => { if (state.saved) router.refresh(); }, [router, state]);
  const selectedColor = isColor(color) ? color : null;
  const updateMeasurement = (id: string, field: "name" | "value", value: string) => setMeasurements((current) => current.map((measurement) => measurement.id === id ? { ...measurement, [field]: value } : measurement));

  return <form action={formAction} className="space-y-6">
    {draft ? <input name="productId" type="hidden" value={draft.id} /> : null}

    <fieldset className={sectionClass}>
      <legend className="px-1 text-lg font-semibold text-reva-primary">Ingreso</legend>
      <p className="max-w-2xl text-sm leading-6 text-reva-secondary">Registra cómo llegó la prenda a REVA. Esta información es operativa y no aparece en el catálogo.</p>
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr_1fr]">
        <div aria-labelledby="source-type-label" className="space-y-2">
          <p className="text-sm font-medium text-reva-primary" id="source-type-label">Origen</p>
          <div className="grid grid-cols-2 gap-2" role="radiogroup">
            {[{ label: "Venta", value: "sell" }, { label: "Donación", value: "donate" }].map((source) => <label className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-medium transition ${sourceType === source.value ? "border-reva-brand bg-reva-muted text-reva-primary" : "border-reva-border bg-reva-surface text-reva-secondary hover:border-reva-brand-strong"}`} key={source.value}>
              <input checked={sourceType === source.value} className="sr-only" name="sourceType" onChange={() => setSourceType(source.value as "sell" | "donate")} type="radio" value={source.value} />{source.label}
            </label>)}
          </div>
        </div>
        <label className={fieldLabelClass} htmlFor="received-at">Fecha de recepción<input className={fieldClass} defaultValue={draft?.receivedAt ?? today} id="received-at" name="receivedAt" required type="date" /></label>
        {sourceType === "sell" ? <label className={fieldLabelClass} htmlFor="acquisition-cost">Costo de adquisición (Q)<input className={fieldClass} defaultValue={draft?.acquisitionCost?.amount ?? ""} id="acquisition-cost" inputMode="decimal" min="0.01" name="acquisitionCost" placeholder="0.00" required step="0.01" type="number" /></label> : <div className="self-end rounded-lg bg-reva-muted px-4 py-3 text-sm leading-6 text-reva-secondary">Las donaciones no registran costo de adquisición.</div>}
      </div>
      <div className="border-l-2 border-reva-brand pl-3 text-sm leading-6 text-reva-secondary"><p className="font-medium text-reva-primary">Contribuidor</p><p>La atribución a perfiles se añadirá cuando exista una búsqueda segura y útil.</p></div>
    </fieldset>

    <fieldset className={sectionClass}>
      <legend className="px-1 text-lg font-semibold text-reva-primary">Identidad de la prenda</legend>
      <div className="grid gap-5 lg:grid-cols-2">
        <label className={`${fieldLabelClass} lg:col-span-2`} htmlFor="title">Nombre de la prenda<input className={fieldClass} defaultValue={draft?.title ?? ""} id="title" name="title" required /></label>
        <label className={fieldLabelClass} htmlFor="brand">Marca<input className={fieldClass} defaultValue={draft?.brand ?? ""} id="brand" name="brand" /></label>
        <label className={fieldLabelClass} htmlFor="garment-type">Tipo de prenda<select className={fieldClass} id="garment-type" name="garmentType" onChange={(event) => setGarmentType(event.target.value)} value={garmentType}><option value="">Aún sin clasificar</option>{garmentTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>
      </div>
      <div aria-labelledby="audience-label" className="space-y-2" role="radiogroup"><div><p className="text-sm font-medium text-reva-primary" id="audience-label">Público</p><p className="mt-1 text-sm text-reva-secondary">Déjalo sin seleccionar si el borrador aún no está clasificado.</p></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{audiences.map((option) => <label className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-medium transition ${audience === option.value ? "border-reva-brand bg-reva-muted text-reva-primary" : "border-reva-border bg-reva-surface text-reva-secondary hover:border-reva-brand-strong"}`} key={option.value}><input checked={audience === option.value} className="sr-only" name="audience" onChange={() => setAudience(option.value)} type="radio" value={option.value} />{option.label}</label>)}</div></div>
      {!isEditing ? <p className="border-l-2 border-reva-brand pl-3 text-sm leading-6 text-reva-secondary">REVA generará el SKU al guardar. La prenda permanece como borrador hasta que complete la publicación.</p> : null}
    </fieldset>

    <fieldset className={sectionClass}>
      <legend className="px-1 text-lg font-semibold text-reva-primary">Características y venta</legend>
      <div className="grid gap-5 lg:grid-cols-2">
        <label className={fieldLabelClass} htmlFor="color"><span className="flex items-center gap-2">Color{selectedColor ? <span aria-label={`Muestra: ${colors.find((option) => option.value === selectedColor)?.label}`} className="size-4 rounded-full border border-reva-border" role="img" style={{ background: colorSwatches[selectedColor] }} /> : null}</span><select className={fieldClass} id="color" name="color" onChange={(event) => setColor(event.target.value)} value={color}><option value="">Aún sin clasificar</option>{hasLegacyColor ? <option disabled value={draft?.color ?? ""}>Valor heredado: {draft?.color} — selecciona un color aprobado</option> : null}{colors.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label className={fieldLabelClass} htmlFor="material-details">Material<input className={fieldClass} defaultValue={draft?.materialDetails ?? ""} id="material-details" name="materialDetails" placeholder="Déjalo vacío si no se conoce" /></label>
        <label className={fieldLabelClass} htmlFor="size-label">Talla indicada<select className={fieldClass} id="size-label" name="sizeLabel" onChange={(event) => setSizeLabel(event.target.value)} value={sizeLabel}><option value="">Sin talla indicada</option>{productSizes.map((size) => <option key={size.value} value={size.value}>{size.label}</option>)}</select></label>
        <label className={fieldLabelClass} htmlFor="price">Precio de venta (Q)<input className={fieldClass} defaultValue={draft?.price?.amount ?? ""} id="price" inputMode="decimal" min="0.01" name="price" placeholder="0.00" step="0.01" type="number" /></label>
      </div>
      <label className={`block ${fieldLabelClass}`} htmlFor="description">Descripción editorial<textarea className={`${fieldClass} min-h-36 py-3`} defaultValue={draft?.description ?? ""} id="description" name="description" /></label>
    </fieldset>

    <fieldset className={sectionClass}>
      <legend className="px-1 text-lg font-semibold text-reva-primary">Talla, condición y medidas</legend>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <label className={fieldLabelClass} htmlFor="condition-rating">Condición<select className={fieldClass} id="condition-rating" name="conditionRating" onChange={(event) => setConditionRating(event.target.value)} value={conditionRating}><option value="">Aún sin evaluar</option>{Object.entries(conditionLabels).reverse().map(([rating, label]) => <option key={rating} value={rating}>{rating} — {label}</option>)}</select></label>
        <label className={fieldLabelClass} htmlFor="condition-notes">Notas de condición<textarea className={`${fieldClass} min-h-24 py-3`} defaultValue={draft?.conditionNotes ?? ""} id="condition-notes" name="conditionNotes" placeholder="Detalles de uso, reparación o cuidado que conviene explicar." /></label>
      </div>
      <div className="space-y-3 border-t border-reva-border pt-5"><div><p className="text-sm font-medium text-reva-primary">Medidas (cm)</p><p className="mt-1 text-sm text-reva-secondary">Agrega solo las medidas relevantes para esta prenda.</p></div>{measurements.map((measurement) => <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto]" key={measurement.id}><input aria-label="Nombre de medida" className={fieldClass} name="measurementName" onChange={(event) => updateMeasurement(measurement.id, "name", event.target.value)} placeholder="Ej. Pecho" value={measurement.name} /><input aria-label="Valor de medida en centímetros" className={fieldClass} inputMode="decimal" min="0.01" name="measurementValue" onChange={(event) => updateMeasurement(measurement.id, "value", event.target.value)} placeholder="54" step="0.01" type="number" value={measurement.value} /><button className="min-h-11 rounded-lg px-3 text-sm font-medium text-reva-secondary underline decoration-reva-border underline-offset-4 hover:text-reva-primary focus:outline-none focus:ring-2 focus:ring-reva-focus" onClick={() => setMeasurements((current) => current.filter((item) => item.id !== measurement.id))} type="button">Quitar</button></div>)}<button className="min-h-11 rounded-lg border border-reva-border px-4 text-sm font-medium text-reva-primary transition hover:border-reva-brand hover:bg-reva-muted focus:outline-none focus:ring-2 focus:ring-reva-focus" onClick={() => setMeasurements((current) => [...current, { id: crypto.randomUUID(), name: "", value: "" }])} type="button">+ Agregar medida</button></div>
    </fieldset>

    {state.error ? <p aria-live="polite" className="rounded-xl border border-reva-danger/30 bg-reva-danger/10 px-4 py-3 text-sm leading-6 text-reva-primary">{state.error}</p> : null}
    {state.saved ? <p aria-live="polite" className="rounded-xl border border-reva-success/30 bg-reva-success/10 px-4 py-3 text-sm leading-6 text-reva-primary">Borrador guardado.</p> : null}
    <div className="sticky bottom-4 z-20 flex flex-wrap items-center gap-4 rounded-xl border border-reva-border bg-reva-background/95 p-4 shadow-lg shadow-reva-primary/10 backdrop-blur"><Button disabled={isPending} type="submit" variant="solid">{isPending ? "Guardando…" : isEditing ? "Guardar borrador" : "Crear borrador"}</Button><p className="text-sm text-reva-secondary">Los cambios se guardan únicamente al presionar este botón.</p></div>
  </form>;
}
