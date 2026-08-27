"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { initialProductPublicationState } from "@/features/product-manager/product-publication-state";
import { publishProductAction, unpublishProductAction } from "@/features/product-manager/server/product-publication.actions";
import type { ProductPublicationReadiness, PublicationRequirement } from "@/features/product-manager/server/product-publication.types";

const labels:Readonly<Record<PublicationRequirement,string>>={audience:"público",condition:"condición",description:"descripción",garment_type:"tipo de prenda",image:"al menos una foto",image_order:"orden de fotos",price:"precio",private_media:"archivo de foto",sizing:"talla o medidas"};

type Props=Readonly<{productId:string;readiness:ProductPublicationReadiness;status:"draft"|"published"}>;

/** Makes lifecycle transitions explicit actions instead of exposing a status selector. */
export function ProductPublicationPanel({productId,readiness,status}:Props){
  const action=status==="draft"?publishProductAction:unpublishProductAction;
  const [state,formAction,pending]=useActionState(action,initialProductPublicationState);
  const ready=readiness.missing.length===0;
  return <section aria-labelledby="publication-heading" className="space-y-4 border-t border-slate-200 pt-8">
    <div><h2 className="text-lg font-semibold text-slate-950" id="publication-heading">Publicación</h2><p className="mt-1 text-sm text-slate-600">{status==="draft"?(ready?"Listo para publicar.":"Falta información antes de publicar."):"Este producto está publicado. Retíralo del catálogo antes de modificar sus datos o fotos."}</p></div>
    {status==="draft"&&readiness.missing.length>0?<ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">{readiness.missing.map((item)=><li key={item}>{labels[item]}</li>)}</ul>:null}
    {state.error?<p aria-live="polite" className="text-sm text-rose-700">{state.error}</p>:null}{state.success?<p aria-live="polite" className="text-sm text-emerald-700">{state.success}</p>:null}
    <form action={formAction}><input name="productId" type="hidden" value={productId}/><Button disabled={pending || (status==="draft"&&!ready)} type="submit" variant="solid">{pending?"Procesando…":status==="draft"?"Publicar":"Retirar de catálogo"}</Button></form>
  </section>;
}
