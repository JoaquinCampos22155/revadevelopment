"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { initialProductPublicationState } from "@/features/product-manager/product-publication-state";
import { markProductSoldAction } from "@/features/product-manager/server/product-manual-sale.actions";
import type { ManualSaleExpectedStatus } from "@/features/product-manager/server/product-manual-sale.repository";

type Props = Readonly<{
  expectedStatus: ManualSaleExpectedStatus;
  productId: string;
  sku: string;
  title: string;
}>;

/** Requires a deliberate confirmation and explicit external-payment attestation. */
export function ProductManualSalePanel({ expectedStatus, productId, sku, title }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(markProductSoldAction, initialProductPublicationState);
  const router = useRouter();

  useEffect(() => {
    if (!state.success) return;
    dialogRef.current?.close();
    router.refresh();
  }, [router, state.success]);

  return (
    <section aria-labelledby="manual-sale-heading" className="space-y-4 rounded-2xl border border-reva-border bg-reva-surface p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-reva-primary" id="manual-sale-heading">Registrar venta manual</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-reva-secondary">Usa esta acción después de confirmar una venta coordinada externamente. No crea una orden ni procesa pagos.</p>
      </div>
      {state.success ? <p aria-live="polite" className="text-sm text-reva-success">{state.success}</p> : null}
      <Button onClick={() => dialogRef.current?.showModal()} type="button" variant="outline">Registrar como vendido</Button>

      <dialog aria-describedby="manual-sale-description" aria-labelledby="manual-sale-dialog-title" className="m-auto w-[min(32rem,calc(100%-2rem))] max-w-none rounded-2xl border border-reva-border bg-reva-surface p-0 text-reva-primary shadow-2xl backdrop:bg-slate-950/45" ref={dialogRef}>
        <div className="space-y-5 p-6">
          <div>
            <h3 className="text-xl font-semibold" id="manual-sale-dialog-title">Confirmar venta de esta prenda</h3>
            <p className="mt-2 text-sm leading-6 text-reva-secondary" id="manual-sale-description">Verifica la identidad de la prenda y confirma que el pago externo ya fue comprobado. REVA solo registrará el cambio de inventario; no verificará ni procesará el pago.</p>
          </div>
          <div className="rounded-xl border border-reva-border bg-reva-muted p-4">
            <p className="font-medium">{title}</p>
            <p className="mt-1 text-sm text-reva-secondary">SKU: {sku}</p>
          </div>
          <form action={formAction} className="space-y-5">
            <input name="productId" type="hidden" value={productId} />
            <input name="expectedStatus" type="hidden" value={expectedStatus} />
            <label className="flex items-start gap-3 text-sm leading-6 text-reva-primary">
              <input className="mt-1 size-4 shrink-0 accent-reva-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" name="externalPaymentVerified" required type="checkbox" value="verified" />
              Confirmo que revisé el pago externo y que corresponde a esta prenda.
            </label>
            {state.error ? <p aria-live="polite" className="text-sm text-reva-danger">{state.error}</p> : null}
            <div className="flex flex-wrap justify-end gap-3">
              <Button disabled={pending} onClick={() => dialogRef.current?.close()} type="button" variant="outline">Cancelar</Button>
              <Button disabled={pending} type="submit" variant="solid">{pending ? "Registrando…" : "Confirmar venta"}</Button>
            </div>
          </form>
        </div>
      </dialog>
    </section>
  );
}
