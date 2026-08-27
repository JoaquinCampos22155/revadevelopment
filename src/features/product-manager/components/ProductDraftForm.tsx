"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/Button";
import { conditionLabels } from "@/features/catalog/condition";
import { audiences } from "@/features/catalog/audiences";
import { colors, isColor } from "@/features/catalog/colors";
import { garmentTypes } from "@/features/catalog/garment-types";
import { productSizes } from "@/features/catalog/sizes";
import {
  createProductDraftAction,
  saveProductDraftAction,
} from "@/features/product-manager/server/product-draft.actions";
import { initialProductDraftFormState } from "@/features/product-manager/product-draft-form-state";
import type { ProductDraft } from "@/features/product-manager/server/product-draft.types";

type MeasurementRow = Readonly<{
  id: string;
  name: string;
  value: string;
}>;

type ProductDraftFormProps = Readonly<{
  draft?: ProductDraft;
  today: string;
}>;

function getMeasurementRows(draft: ProductDraft | undefined): MeasurementRow[] {
  if (!draft?.measurements) return [];

  return Object.entries(draft.measurements).map(([name, value], index) => ({
    id: `${name}-${index}`,
    name,
    value: value.replace(/\s*cm$/i, ""),
  }));
}

/**
 * Keeps the Product Manager form operational and intentionally small. It owns
 * only browser interaction for conditional fields and measurements; mutation
 * authority remains in Server Actions, services, repositories, and RLS.
 */
export function ProductDraftForm({ draft, today }: ProductDraftFormProps) {
  const isEditing = Boolean(draft);
  const hasLegacyColor = Boolean(draft?.color && !isColor(draft.color));
  const [state, formAction, isPending] = useActionState(
    isEditing ? saveProductDraftAction : createProductDraftAction,
    initialProductDraftFormState,
  );
  const [sourceType, setSourceType] = useState(draft?.sourceType ?? "sell");
  const [measurements, setMeasurements] = useState<MeasurementRow[]>(() =>
    getMeasurementRows(draft),
  );

  function addMeasurement(): void {
    setMeasurements((current) => [
      ...current,
      { id: crypto.randomUUID(), name: "", value: "" },
    ]);
  }

  function updateMeasurement(
    id: string,
    field: "name" | "value",
    value: string,
  ): void {
    setMeasurements((current) =>
      current.map((measurement) =>
        measurement.id === id ? { ...measurement, [field]: value } : measurement,
      ),
    );
  }

  function removeMeasurement(id: string): void {
    setMeasurements((current) => current.filter((measurement) => measurement.id !== id));
  }

  return (
    <form action={formAction} className="space-y-8">
      {draft ? <input name="productId" type="hidden" value={draft.id} /> : null}

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-slate-950">Ingreso</legend>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Registramos cómo llegó la prenda a REVA sin exponer esta información en el catálogo.
        </p>

        <div className="grid gap-5 md:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-slate-950" htmlFor="source-type">
            Origen
            <select
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
              id="source-type"
              name="sourceType"
              onChange={(event) => setSourceType(event.target.value as "sell" | "donate")}
              value={sourceType}
            >
              <option value="sell">Venta</option>
              <option value="donate">Donación</option>
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-950" htmlFor="received-at">
            Fecha de recepción
            <input
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
              defaultValue={draft?.receivedAt ?? today}
              id="received-at"
              name="receivedAt"
              required
              type="date"
            />
          </label>

        {sourceType === "sell" ? (
          <label className="block space-y-2 text-sm font-medium text-slate-950" htmlFor="acquisition-cost">
            ¿Cuánto pagó REVA por la prenda? (Q)
            <input
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
              defaultValue={draft?.acquisitionCost?.amount ?? ""}
              id="acquisition-cost"
              inputMode="decimal"
              min="0.01"
              name="acquisitionCost"
              placeholder="0.00"
              required
              step="0.01"
              type="number"
            />
          </label>
          ) : (
          <p className="self-end text-sm leading-6 text-slate-600">
            En una donación no registramos costo de adquisición.
          </p>
          )}
        </div>

        <div className="border-l-2 border-slate-200 pl-3 text-sm leading-6 text-slate-600">
          <p className="font-medium text-slate-950">Contribuidor</p><p>La atribución a perfiles se añadirá cuando exista una búsqueda segura y útil.</p>
        </div>
      </fieldset>

      <fieldset className="space-y-5 border-t border-slate-200 pt-6">
        <legend className="text-lg font-semibold text-slate-950">Identidad de la prenda</legend>
        <label className="block space-y-2 text-sm font-medium text-slate-950" htmlFor="title">
          Nombre de la prenda
          <input
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
            defaultValue={draft?.title ?? ""}
            id="title"
            name="title"
            required
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-950" htmlFor="brand">
            Marca
            <input className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" defaultValue={draft?.brand ?? ""} id="brand" name="brand" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-950" htmlFor="garment-type">
            Tipo de prenda
            <select className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" defaultValue={draft?.garmentType ?? ""} id="garment-type" name="garmentType">
              <option value="">Aún sin clasificar</option>
              {garmentTypes.map((garmentType) => (<option key={garmentType.value} value={garmentType.value}>{garmentType.label}</option>))}
            </select>
          </label>
        </div>

        <div aria-labelledby="audience-label" className="space-y-3" role="radiogroup">
          <p className="text-sm font-medium text-slate-950" id="audience-label">Público</p>
          <p className="text-sm text-slate-600">Déjalo sin seleccionar si el borrador aún no está clasificado.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {audiences.map((audience) => (
              <label className="flex min-h-11 items-center gap-2 text-sm text-slate-800" key={audience.value}>
                <input defaultChecked={draft?.audience === audience.value} name="audience" type="radio" value={audience.value} />
                {audience.label}
              </label>
            ))}
          </div>
        </div>

        {!isEditing ? (
          <p className="border-l-2 border-cyan-300 pl-3 text-sm leading-6 text-slate-700">
            REVA generará el SKU al guardar. La prenda permanecerá como borrador hasta una publicación futura.
          </p>
        ) : null}
      </fieldset>

      <>
          <fieldset className="space-y-5 border-t border-slate-200 pt-6">
            <legend className="text-lg font-semibold text-slate-950">Características y venta</legend>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-950" htmlFor="color">
                Color
                <select className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" defaultValue={draft?.color ?? ""} id="color" name="color">
                  <option value="">Aún sin clasificar</option>
                  {hasLegacyColor ? (
                    <option disabled value={draft?.color ?? ""}>
                      Valor heredado: {draft?.color} — selecciona un color aprobado
                    </option>
                  ) : null}
                  {colors.map((color) => (
                    <option key={color.value} value={color.value}>{color.label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-950" htmlFor="material-details">
                Material
                <input className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" defaultValue={draft?.materialDetails ?? ""} id="material-details" name="materialDetails" placeholder="Déjalo vacío si no se conoce" />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-950" htmlFor="size-label">
                Talla indicada
                <select className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" defaultValue={draft?.sizeLabel ?? ""} id="size-label" name="sizeLabel">
                  <option value="">Sin talla indicada</option>
                  {productSizes.map((size) => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-950" htmlFor="price">
                Precio de venta (Q)
                <input className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" defaultValue={draft?.price?.amount ?? ""} id="price" inputMode="decimal" min="0.01" name="price" placeholder="0.00" step="0.01" type="number" />
              </label>
            </div>

            <label className="block space-y-2 text-sm font-medium text-slate-950" htmlFor="description">
              Descripción editorial
              <textarea className="min-h-32 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" defaultValue={draft?.description ?? ""} id="description" name="description" />
            </label>
          </fieldset>

          <fieldset className="space-y-5 border-t border-slate-200 pt-6">
            <legend className="text-lg font-semibold text-slate-950">Talla y condición</legend>
            <label className="block max-w-md space-y-2 text-sm font-medium text-slate-950" htmlFor="condition-rating">
              Condición
              <select className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" defaultValue={draft?.conditionRating?.toString() ?? ""} id="condition-rating" name="conditionRating">
                <option value="">Aún sin evaluar</option>
                {Object.entries(conditionLabels).reverse().map(([rating, label]) => (
                  <option key={rating} value={rating}>{rating} — {label}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-950" htmlFor="condition-notes">
              Notas de condición
              <textarea className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" defaultValue={draft?.conditionNotes ?? ""} id="condition-notes" name="conditionNotes" placeholder="Detalles de uso, reparación o cuidado que conviene explicar." />
            </label>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-950">Medidas (cm)</p>
                <p className="mt-1 text-sm text-slate-600">Agrega solo las medidas relevantes para esta prenda.</p>
              </div>
              {measurements.map((measurement) => (
                <div className="grid gap-3 sm:grid-cols-[1fr_12rem_auto]" key={measurement.id}>
                  <input aria-label="Nombre de medida" className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" name="measurementName" onChange={(event) => updateMeasurement(measurement.id, "name", event.target.value)} placeholder="Ej. Pecho" value={measurement.name} />
                  <input aria-label="Valor de medida en centímetros" className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" inputMode="decimal" min="0.01" name="measurementValue" onChange={(event) => updateMeasurement(measurement.id, "value", event.target.value)} placeholder="54" step="0.01" type="number" value={measurement.value} />
                  <button className="min-h-11 rounded-xl px-3 text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950" onClick={() => removeMeasurement(measurement.id)} type="button">Quitar</button>
                </div>
              ))}
              <button className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-950 transition hover:border-cyan-700 hover:bg-cyan-50" onClick={addMeasurement} type="button">+ Agregar medida</button>
            </div>
          </fieldset>

      </>

      {state.error ? <p aria-live="polite" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">{state.error}</p> : null}
      {state.saved ? <p aria-live="polite" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">Borrador guardado.</p> : null}

      <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6">
        <Button disabled={isPending} type="submit" variant="solid">
          {isPending ? "Guardando…" : isEditing ? "Guardar borrador" : "Crear borrador"}
        </Button>
        <p className="text-sm text-slate-600">Los cambios se guardan únicamente al presionar este botón.</p>
      </div>
    </form>
  );
}
