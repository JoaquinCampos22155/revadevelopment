import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { createProductDraftReadService } from "@/features/product-manager/server/product-draft.composition";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Productos | Administración REVA",
  robots: { follow: false, index: false },
};

function formatUpdatedAt(date: Date): string {
  return new Intl.DateTimeFormat("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Presents only the first handful of operational drafts without becoming a generic dashboard. */
export default async function ProductManagerPage() {
  const service = await createProductDraftReadService();
  const drafts = await service.listDrafts();

  return (
    <main id="main-content">
      <Section>
        <div className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="space-y-3">
              <Text variant="label">Administración interna</Text>
              <Heading level={1} variant="editorial">Productos</Heading>
              <Text className="max-w-2xl" variant="body">
                Registra prendas recibidas por REVA y continúa sus borradores antes de prepararlos para publicación.
              </Text>
            </div>
            <Button href="/admin/productos/nuevo" variant="solid">Registrar prenda</Button>
          </div>

          {drafts.length ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="hidden grid-cols-[1.6fr_0.8fr_0.8fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-600 md:grid">
                <span>Prenda</span><span>SKU</span><span>Actualizado</span><span />
              </div>
              <ul className="divide-y divide-slate-200">
                {drafts.map((draft) => (
                  <li className="grid gap-4 px-5 py-5 md:grid-cols-[1.6fr_0.8fr_0.8fr_auto] md:items-center" key={draft.id}>
                    <div><p className="font-medium text-slate-950">{draft.title}</p><p className="mt-1 text-sm text-slate-600">Borrador</p></div>
                    <p className="text-sm text-slate-700">{draft.sku}</p>
                    <p className="text-sm text-slate-600">{formatUpdatedAt(draft.updatedAt)}</p>
                    <Button href={`/admin/productos/${draft.id}`} variant="outline">Continuar</Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <Heading level={2} variant="clean">Aún no hay borradores.</Heading>
              <Text className="mx-auto mt-3 max-w-md" variant="quiet">Cuando REVA reciba una prenda, regístrala aquí para iniciar su preparación.</Text>
              <div className="mt-6"><Button href="/admin/productos/nuevo" variant="solid">Registrar primera prenda</Button></div>
            </div>
          )}
        </div>
      </Section>
    </main>
  );
}
