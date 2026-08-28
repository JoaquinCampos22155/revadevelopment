"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { initialProductRecommendationActionState } from "@/features/merchandising/product-recommendation-state";
import { moveProductRecommendationAction, removeProductRecommendationAction } from "@/features/merchandising/server/product-recommendation.actions";
import type { ProductRecommendation } from "@/features/merchandising/server/product-recommendation.types";

type Props = Readonly<{ recommendations: ReadonlyArray<ProductRecommendation> }>;

function RecommendationRow({ index, recommendation, total }: Readonly<{ index: number; recommendation: ProductRecommendation; total: number }>) {
  const [moveState, moveAction, movePending] = useActionState(moveProductRecommendationAction, initialProductRecommendationActionState);
  const [removeState, removeAction, removePending] = useActionState(removeProductRecommendationAction, initialProductRecommendationActionState);

  return <li className="grid gap-3 border-b border-slate-200 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
    <p className="font-serif text-2xl text-slate-700">{recommendation.position}</p>
    <div><p className="font-medium text-slate-950">{recommendation.title}</p><p className="text-sm text-slate-600">{recommendation.sku}</p></div>
    <div className="flex flex-wrap gap-2">
      <form action={moveAction}><input name="productId" type="hidden" value={recommendation.productId} /><input name="direction" type="hidden" value="up" /><Button disabled={movePending || index === 0} type="submit" variant="outline">Subir</Button></form>
      <form action={moveAction}><input name="productId" type="hidden" value={recommendation.productId} /><input name="direction" type="hidden" value="down" /><Button disabled={movePending || index === total - 1} type="submit" variant="outline">Bajar</Button></form>
      <form action={removeAction}><input name="productId" type="hidden" value={recommendation.productId} /><Button disabled={removePending} type="submit" variant="outline">Retirar</Button></form>
    </div>
    {moveState.error || removeState.error ? <p aria-live="polite" className="text-sm text-rose-700 sm:col-span-3">{moveState.error ?? removeState.error}</p> : null}
    {moveState.success || removeState.success ? <p aria-live="polite" className="text-sm text-emerald-700 sm:col-span-3">{moveState.success ?? removeState.success}</p> : null}
  </li>;
}

/** Offers the one global ordering control without overloading individual Product pages. */
export function ProductRecommendationManagementList({ recommendations }: Props) {
  if (!recommendations.length) return <p className="border-y border-dashed border-slate-300 py-8 text-sm text-slate-600">Aún no hay productos recomendados.</p>;
  return <ol>{recommendations.map((recommendation, index) => <RecommendationRow index={index} key={recommendation.productId} recommendation={recommendation} total={recommendations.length} />)}</ol>;
}
