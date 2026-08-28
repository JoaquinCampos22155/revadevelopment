import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { ProductContactCta } from "@/features/catalog/components/ProductContactCta";
import { ProductGallery } from "@/features/catalog/components/ProductGallery";
import { audienceLabel, colorLabel, garmentTypeLabel } from "@/features/catalog/public-product.presentation";
import { conditionLabels } from "@/features/catalog/condition";
import { createPublicProductService } from "@/features/catalog/server/public-product.service";

type ProductPageProps = Readonly<{ params: Promise<{ slug: string }> }>;

/** Creates Product-specific metadata from the safe published Product contract. */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await (await createPublicProductService()).getPublishedBySlug(slug);
  if (!product) return {};
  return { title:`${product.title} | REVA`,description:product.description,alternates:{canonical:`/productos/${product.slug}`}};
}

/** Renders only published Product facts and deliberately omits unsupported editorial claims. */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await (await createPublicProductService()).getPublishedBySlug(slug);
  if (!product) notFound();
  const gallery = product.images.map((image) => ({alt:image.altText,height:image.height,src:image.url,width:image.width}));

  return <main id="main-content">
    <Section>
      <div className="mb-8"><Button href="/catalogo">Volver al catálogo</Button></div>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <ProductGallery images={gallery} />
        <div className="space-y-7 lg:sticky lg:top-24">
          <div className="space-y-4"><Text variant="label">Selección REVA</Text><Heading level={1} variant="editorial">{product.title}</Heading><Text className="text-lg" variant="body">{product.description}</Text><p className="text-xl font-medium text-slate-950">Q {product.price.amount}</p></div>
          <dl className="grid grid-cols-2 gap-4 border-y border-sky-100 py-6">
            <div><dt className="text-sm text-slate-500">Marca</dt><dd className="mt-1 font-medium">{product.brand ?? "No indicada"}</dd></div>
            <div><dt className="text-sm text-slate-500">Tipo</dt><dd className="mt-1 font-medium">{garmentTypeLabel(product.garmentType)}</dd></div>
            <div><dt className="text-sm text-slate-500">Público</dt><dd className="mt-1 font-medium">{audienceLabel(product.audience)}</dd></div>
            <div><dt className="text-sm text-slate-500">Color</dt><dd className="mt-1 font-medium">{product.color ? colorLabel(product.color) : "No indicado"}</dd></div>
            <div><dt className="text-sm text-slate-500">Talla</dt><dd className="mt-1 font-medium">{product.sizeLabel ?? "Ver medidas"}</dd></div>
            <div><dt className="text-sm text-slate-500">Condición</dt><dd className="mt-1 font-medium">{conditionLabels[product.conditionRating]}</dd></div>
          </dl>
          {product.materialDetails || product.measurements ? <div className="space-y-2 text-sm text-slate-700">{product.materialDetails ? <p><span className="font-medium text-slate-950">Material: </span>{product.materialDetails}</p> : null}{product.measurements ? <p><span className="font-medium text-slate-950">Medidas: </span>{Object.entries(product.measurements).map(([name,value])=>`${name}: ${value}`).join(" · ")}</p> : null}</div> : null}
          {product.conditionNotes ? <p className="text-sm text-slate-700"><span className="font-medium text-slate-950">Notas de condición: </span>{product.conditionNotes}</p> : null}
          <ProductContactCta />
        </div>
      </div>
    </Section>
  </main>;
}
