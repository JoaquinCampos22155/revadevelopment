import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { ProductDraftForm } from "@/features/product-manager/components/ProductDraftForm";
import { ProductMediaManager } from "@/features/product-manager/components/ProductMediaManager";
import { ProductPublicationPanel } from "@/features/product-manager/components/ProductPublicationPanel";
import { createProductDraftReadService } from "@/features/product-manager/server/product-draft.composition";
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
  const draft = await (await createProductDraftReadService()).findDraftById(productId);
  if (!draft) notFound();

  const isDraft = draft.status === "draft";
  const [images, readiness] = await Promise.all([
    (await createProductMediaReadService()).list(draft.id),
    (await createProductPublicationReadService()).getReadiness(draft.id),
  ]);

  return (
    <main id="main-content">
      <Section>
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-4">
            <Button href="/admin/productos" variant="outline">Volver a productos</Button>
            <div className="space-y-2">
              <Text variant="label">{draft.sku} · {isDraft ? "Borrador" : "Publicado"}</Text>
              <Heading level={1} variant="editorial">{draft.title}</Heading>
              <Text variant="quiet">{isDraft ? "Completa la información y revisa la preparación antes de publicar." : "Retíralo de publicación antes de modificar sus datos o fotos."}</Text>
            </div>
          </div>
          {isDraft ? <ProductDraftForm draft={draft} today={draft.receivedAt} /> : null}
          <ProductMediaManager images={images} productId={draft.id} readOnly={!isDraft} />
          <ProductPublicationPanel productId={draft.id} readiness={readiness} status={isDraft ? "draft" : "published"} />
        </div>
      </Section>
    </main>
  );
}
