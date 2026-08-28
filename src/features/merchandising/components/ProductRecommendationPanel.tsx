"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { initialProductRecommendationActionState } from "@/features/merchandising/product-recommendation-state";
import { addProductRecommendationAction, removeProductRecommendationAction } from "@/features/merchandising/server/product-recommendation.actions";

type ProductRecommendationPanelProps = Readonly<{
  eligible: boolean;
  position: number | null;
  productId: string;
}>;

/** Keeps individual Product merchandising explicit without adding generic Product fields. */
export function ProductRecommendationPanel({ eligible, position, productId }: ProductRecommendationPanelProps) {
  const action = position === null ? addProductRecommendationAction : removeProductRecommendationAction;
  const [state, formAction, pending] = useActionState(action, initialProductRecommendationActionState);

  return <section aria-labelledby="recommendation-heading" className="space-y-4 border-t border-slate-200 pt-8">
    <div>
      <h2 className="text-lg font-semibold text-slate-950" id="recommendation-heading">Recomendado por REVA</h2>
      <p className="mt-1 text-sm text-slate-600">{position !== null ? `Actualmente ocupa la posición ${position}.` : eligible ? "Puedes mostrar este producto en la selección editorial de Inicio." : "Solo los productos publicados y visibles públicamente pueden recomendarse."}</p>
    </div>
    {state.error ? <p aria-live="polite" className="text-sm text-rose-700">{state.error}</p> : null}
    {state.success ? <p aria-live="polite" className="text-sm text-emerald-700">{state.success}</p> : null}
    {position !== null || eligible ? <form action={formAction}><input name="productId" type="hidden" value={productId} /><Button disabled={pending} type="submit" variant="outline">{pending ? "Actualizando…" : position === null ? "Agregar a recomendados" : "Retirar de recomendados"}</Button></form> : null}
  </section>;
}
