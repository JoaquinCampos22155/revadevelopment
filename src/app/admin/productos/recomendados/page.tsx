import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { ProductRecommendationManagementList } from "@/features/merchandising/components/ProductRecommendationManagementList";
import { createProductRecommendationReadService } from "@/features/merchandising/server/product-recommendation.composition";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recomendado por REVA | Administración REVA",
  robots: { follow: false, index: false },
};

/** Provides the small global ordering surface required by explicit Home merchandising. */
export default async function ProductRecommendationsPage() {
  const recommendations = await (await createProductRecommendationReadService()).list();

  return <main id="main-content"><Section><div className="mx-auto max-w-4xl space-y-8">
    <div className="space-y-4"><Button href="/admin/productos" variant="outline">Volver a productos</Button><div className="space-y-3"><Text variant="label">Administración interna</Text><Heading level={1} variant="editorial">Recomendado por REVA</Heading><Text className="max-w-2xl" variant="body">Ordena las piezas que aparecen en Inicio. Solo los productos publicados y visibles pueden agregarse.</Text></div></div>
    <ProductRecommendationManagementList recommendations={recommendations} />
  </div></Section></main>;
}
