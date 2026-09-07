"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { initialProductPublicationState } from "@/features/product-manager/product-publication-state";
import { publishProductAction, unpublishProductAction } from "@/features/product-manager/server/product-publication.actions";
import type { ProductPublicationReadiness, PublicationRequirement } from "@/features/product-manager/server/product-publication.types";

const requirements: ReadonlyArray<Readonly<{ key: PublicationRequirement; label: string }>> = [
  { key: "audience", label: "Público" },
  { key: "garment_type", label: "Tipo de prenda" },
  { key: "condition", label: "Condición" },
  { key: "price", label: "Precio" },
  { key: "sizing", label: "Talla o medidas" },
  { key: "description", label: "Descripción" },
  { key: "image", label: "Fotografías" },
  { key: "image_order", label: "Orden de fotografías" },
  { key: "private_media", label: "Archivos de fotografías" },
];

type Props = Readonly<{ productId: string; readiness: ProductPublicationReadiness; status: "draft" | "published" }>;

/** Renders the exact server-reported readiness state; it never creates a UI-only publish rule. */
export function ProductPublicationPanel({ productId, readiness, status }: Props) {
  const action = status === "draft" ? publishProductAction : unpublishProductAction;
  const [state, formAction, pending] = useActionState(action, initialProductPublicationState);
  const ready = readiness.missing.length === 0;

  if (status === "published") {
    return <section aria-labelledby="publication-heading" className="space-y-4 rounded-2xl border border-reva-border bg-reva-muted p-5 sm:p-6"><div><h2 className="text-lg font-semibold text-reva-primary" id="publication-heading">Publicado</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-reva-secondary">Los datos y fotografías de una prenda publicada permanecen bloqueados para proteger lo que ve el público.</p></div><ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-reva-secondary"><li>Retira el producto del catálogo.</li><li>Edita la información o las fotografías del borrador.</li><li>Revisa los requisitos y publícalo de nuevo.</li></ol>{state.error ? <p aria-live="polite" className="text-sm text-reva-danger">{state.error}</p> : null}{state.success ? <p aria-live="polite" className="text-sm text-reva-success">{state.success}</p> : null}<form action={formAction}><input name="productId" type="hidden" value={productId} /><Button disabled={pending} type="submit" variant="solid">{pending ? "Procesando…" : "Retirar de catálogo"}</Button></form></section>;
  }

  return <section aria-labelledby="publication-heading" className="space-y-5 rounded-2xl border border-reva-border bg-reva-surface p-5 sm:p-6"><div><h2 className="text-lg font-semibold text-reva-primary" id="publication-heading">Preparación para publicar</h2><p className="mt-1 text-sm leading-6 text-reva-secondary">{ready ? "El servidor confirmó que este borrador está listo para publicar." : "Completa los elementos pendientes. La validación final siempre ocurre en el servidor."}</p></div><ul className="grid gap-2 sm:grid-cols-2" aria-label="Requisitos de publicación">{requirements.map((requirement) => { const complete = !readiness.missing.includes(requirement.key); return <li className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${complete ? "bg-reva-muted text-reva-primary" : "bg-reva-background text-reva-secondary"}`} key={requirement.key}><span aria-hidden="true" className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full text-xs ${complete ? "bg-reva-brand text-reva-on-action" : "border border-reva-border"}`}>{complete ? "✓" : ""}</span>{requirement.label}</li>; })}</ul>{state.error ? <p aria-live="polite" className="text-sm text-reva-danger">{state.error}</p> : null}{state.success ? <p aria-live="polite" className="text-sm text-reva-success">{state.success}</p> : null}<form action={formAction}><input name="productId" type="hidden" value={productId} /><Button disabled={pending || !ready} type="submit" variant="solid">{pending ? "Procesando…" : ready ? "Publicar" : "Publicar cuando esté listo"}</Button></form></section>;
}
