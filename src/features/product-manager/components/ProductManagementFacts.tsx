import { audiences } from "@/features/catalog/audiences";
import { colors } from "@/features/catalog/colors";
import { conditionLabels } from "@/features/catalog/condition";
import { garmentTypes } from "@/features/catalog/garment-types";
import { productSizes } from "@/features/catalog/sizes";
import type { ProductDraft } from "@/features/product-manager/server/product-draft.types";

function controlledLabel(
  value: string | null,
  options: ReadonlyArray<Readonly<{ label: string; value: string }>>,
  emptyLabel = "Sin indicar",
): string {
  if (!value) return emptyLabel;

  return options.find((option) => option.value === value)?.label ?? "Sin clasificar";
}

function Fact({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</dt>
      <dd className="text-sm leading-6 text-slate-900">{value}</dd>
    </div>
  );
}

/** Presents approved Product facts without leaking Intake or audit information. */
export function ProductManagementFacts({ product }: Readonly<{ product: ProductDraft }>) {
  const condition = product.conditionRating === null
    ? "Sin evaluar"
    : `${product.conditionRating} — ${conditionLabels[product.conditionRating]}`;
  const measurements = product.measurements
    ? Object.entries(product.measurements).map(([name, value]) => `${name}: ${value}`).join(" · ")
    : "Sin medidas registradas";

  return (
    <section aria-labelledby="product-facts-heading" className="space-y-5 border-t border-slate-200 pt-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-950" id="product-facts-heading">Información</h2>
        <p className="mt-1 text-sm text-slate-600">Datos actuales de la prenda.</p>
      </div>

      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <Fact label="Precio" value={product.price ? `Q${product.price.amount}` : "Sin precio indicado"} />
        <Fact label="Marca" value={product.brand ?? "Sin marca indicada"} />
        <Fact label="Público" value={controlledLabel(product.audience, audiences)} />
        <Fact label="Tipo de prenda" value={controlledLabel(product.garmentType, garmentTypes)} />
        <Fact label="Color" value={controlledLabel(product.color, colors)} />
        <Fact label="Talla" value={controlledLabel(product.sizeLabel, productSizes, "Sin talla indicada")} />
        <Fact label="Condición" value={condition} />
        {product.materialDetails ? <Fact label="Material" value={product.materialDetails} /> : null}
      </dl>

      <div className="space-y-4 border-t border-slate-100 pt-5">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-950">Descripción</h3>
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{product.description ?? "Sin descripción registrada."}</p>
        </div>
        {product.conditionNotes ? (
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-950">Notas de condición</h3>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{product.conditionNotes}</p>
          </div>
        ) : null}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-950">Medidas</h3>
          <p className="text-sm leading-6 text-slate-700">{measurements}</p>
        </div>
      </div>
    </section>
  );
}
