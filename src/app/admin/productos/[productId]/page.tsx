import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { ProductDraftForm } from "@/features/product-manager/components/ProductDraftForm";
import { ProductManagementFacts } from "@/features/product-manager/components/ProductManagementFacts";
import { ProductMediaManager } from "@/features/product-manager/components/ProductMediaManager";
import { ProductManualSalePanel } from "@/features/product-manager/components/ProductManualSalePanel";
import { ProductPublicationPanel } from "@/features/product-manager/components/ProductPublicationPanel";
import { ProductRecommendationPanel } from "@/features/merchandising/components/ProductRecommendationPanel";
import { ProductAdminAtmosphere } from "@/features/product-manager/components/ProductAdminAtmosphere";
import { createProductRecommendationReadService } from "@/features/merchandising/server/product-recommendation.composition";
import { getProductPublicationStatusPresentation } from "@/features/product-manager/product-publication-status";
import { createProductManagerReadService } from "@/features/product-manager/server/product-draft.composition";
import { createProductMediaReadService } from "@/features/product-manager/server/product-media.composition";
import { createProductPublicationReadService } from "@/features/product-manager/server/product-publication.composition";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Producto | Administración REVA",
  robots: { follow: false, index: false },
};

type ProductDraftPageProps = Readonly<{ params: Promise<{ productId: string }> }>;

/** Loads an internal Product through the admin RLS context rather than public projections. */
export default async function ProductDraftPage({ params }: ProductDraftPageProps) {
  const { productId } = await params;
  const draft = await (await createProductManagerReadService()).findById(productId);
  if (!draft) notFound();

  const isDraft = draft.status === "draft";
  const publication = getProductPublicationStatusPresentation(
    draft.status,
    draft.status === "published",
  );
  const images = await (await createProductMediaReadService()).list(draft.id);
  const readiness = isDraft
    ? await (await createProductPublicationReadService()).getReadiness(draft.id)
    : null;
  const recommendation = await (await createProductRecommendationReadService()).getStatus(draft.id);

  return (
    <main id="main-content"><ProductAdminAtmosphere>
      <Section>
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-4">
            <Button href="/admin/productos" variant="outline">Volver a productos</Button>
            <div className="space-y-3 border-b border-reva-border pb-6">
              <div className="flex flex-wrap items-center gap-3">
                <Text variant="label">{draft.sku}</Text>
                <span className={publication.tone === "public" || publication.tone === "sold" ? "inline-flex items-center gap-2 text-sm font-medium text-reva-success" : "inline-flex items-center gap-2 text-sm font-medium text-reva-secondary"}>
                  {publication.tone === "sold" ? <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.7" /><path d="m6 10 2.5 2.5L14 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></svg> : <span aria-hidden="true" className={publication.tone === "public" ? "size-2 rounded-full border border-reva-border bg-reva-success" : "size-2 rounded-full border border-reva-border bg-reva-disabled"} />}
                  {publication.label}{publication.domainLabel ? ` · ${publication.domainLabel}` : ""}
                </span>
              </div>
              <Heading level={1} variant="editorial">{draft.title}</Heading>
              <Text variant="quiet">{isDraft ? "Puedes actualizar la información y las fotos antes de publicar." : draft.status === "published" ? "Este producto está publicado. Retíralo del catálogo antes de modificar sus datos o fotografías." : draft.status === "sold" ? "Esta prenda se registró como vendida y ya no está disponible para compra." : "Este estado no tiene una acción operativa aprobada todavía."}</Text>
            </div>
          </div>

          {isDraft ? <ProductDraftForm draft={draft} key={`${draft.id}-${draft.updatedAt.toISOString()}`} today={draft.receivedAt} /> : <ProductManagementFacts product={draft} />}
          {draft.status === "draft" || draft.status === "published" ? <ProductManualSalePanel expectedStatus={draft.status} productId={draft.id} sku={draft.sku} title={draft.title} /> : null}
          <ProductMediaManager images={images} productId={draft.id} readOnly={!isDraft} />
          {readiness ? <ProductPublicationPanel productId={draft.id} readiness={readiness} status="draft" /> : null}
          {draft.status === "published" ? <ProductPublicationPanel productId={draft.id} readiness={{ missing: [] }} status="published" /> : null}
          {recommendation ? <ProductRecommendationPanel eligible={recommendation.eligible} position={recommendation.position} productId={draft.id} /> : null}
        </div>
      </Section>
    </ProductAdminAtmosphere></main>
  );
}
