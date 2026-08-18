import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { ProductDraftForm } from "@/features/product-manager/components/ProductDraftForm";
import { createProductDraftReadService } from "@/features/product-manager/server/product-draft.composition";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Borrador de producto | Administración REVA",
  robots: { follow: false, index: false },
};

type ProductDraftPageProps = Readonly<{ params: Promise<{ productId: string }> }>;

/** Loads an internal draft through the admin RLS context rather than public projections. */
export default async function ProductDraftPage({ params }: ProductDraftPageProps) {
  const { productId } = await params;
  const service = await createProductDraftReadService();
  const draft = await service.findDraftById(productId);

  if (!draft) notFound();

  return (
    <main id="main-content">
      <Section>
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-4">
            <Button href="/admin/productos" variant="outline">Volver a productos</Button>
            <div className="space-y-2">
              <Text variant="label">{draft.sku} · Borrador</Text>
              <Heading level={1} variant="editorial">{draft.title}</Heading>
              <Text variant="quiet">Completa la información con calma. La publicación y las imágenes pertenecen a los próximos Sprints.</Text>
            </div>
          </div>
          <ProductDraftForm draft={draft} today={draft.receivedAt} />
        </div>
      </Section>
    </main>
  );
}
