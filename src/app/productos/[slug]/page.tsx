import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/Section";
import { JsonLd } from "@/components/seo/JsonLd";
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

  const structuredProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((image) => image.url),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    category: garmentTypeLabel(product.garmentType),
  };

  return <main id="main-content">
    <JsonLd data={structuredProduct} />
    <Section>
      <div className="mb-8"><Button href="/catalogo">Volver al catálogo</Button></div>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <ProductGallery images={gallery} />
          <div className="space-y-7 lg:sticky lg:top-24">
          <div className="space-y-4"><Text className="text-reva-brand-strong" variant="label">Selección REVA</Text><Heading className="text-reva-primary" level={1} variant="editorial">{product.title}</Heading><Text className="text-lg text-reva-secondary" variant="body">{product.description}</Text><p className="text-xl font-medium text-reva-primary">Q {product.price.amount}</p></div>
          <dl className="grid grid-cols-2 gap-4 border-y border-reva-border py-6">
            <div><dt className="text-sm text-reva-secondary">Marca</dt><dd className="mt-1 font-medium text-reva-primary">{product.brand ?? "No indicada"}</dd></div>
            <div><dt className="text-sm text-reva-secondary">Tipo</dt><dd className="mt-1 font-medium text-reva-primary">{garmentTypeLabel(product.garmentType)}</dd></div>
            <div><dt className="text-sm text-reva-secondary">Público</dt><dd className="mt-1 font-medium text-reva-primary">{audienceLabel(product.audience)}</dd></div>
            <div><dt className="text-sm text-reva-secondary">Color</dt><dd className="mt-1 font-medium text-reva-primary">{product.color ? colorLabel(product.color) : "No indicado"}</dd></div>
            <div><dt className="text-sm text-reva-secondary">Talla</dt><dd className="mt-1 font-medium text-reva-primary">{product.sizeLabel ?? "Ver medidas"}</dd></div>
            <div><dt className="text-sm text-reva-secondary">Condición</dt><dd className="mt-1 font-medium text-reva-primary">{conditionLabels[product.conditionRating]}</dd></div>
          </dl>
          {product.materialDetails || product.measurements ? <div className="space-y-2 text-sm text-reva-secondary">{product.materialDetails ? <p><span className="font-medium text-reva-primary">Material: </span>{product.materialDetails}</p> : null}{product.measurements ? <p><span className="font-medium text-reva-primary">Medidas: </span>{Object.entries(product.measurements).map(([name,value])=>`${name}: ${value}`).join(" · ")}</p> : null}</div> : null}
          {product.conditionNotes ? <p className="text-sm text-reva-secondary"><span className="font-medium text-reva-primary">Notas de condición: </span>{product.conditionNotes}</p> : null}
          <ProductContactCta />
        </div>
      </div>
    </Section>
  </main>;
}
