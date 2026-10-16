import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { Section } from "@/components/layout/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { ProductContactCta } from "@/features/catalog/components/ProductContactCta";
import { AddToCartButton } from "@/features/cart/components/AddToCartButton";
import { ProductGallery } from "@/features/catalog/components/ProductGallery";
import { PdpMobileStickyPurchase } from "@/features/catalog/components/PdpMobileStickyPurchase";
import { audienceLabel, colorLabel, garmentTypeLabel } from "@/features/catalog/public-product.presentation";
import { conditionLabels } from "@/features/catalog/condition";
import { getProductAtmosphere } from "@/features/catalog/product-atmosphere";
import { createPublicProductService } from "@/features/catalog/server/public-product.service";
import { getPublicProductUrl } from "@/infrastructure/config/site";

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
  const canonicalUrl = getPublicProductUrl(product.slug);
  const conditionNote = product.conditionNotes?.trim();
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

  return (
    <main
      className="reva-route-transition reva-pdp"
      id="main-content"
      style={{ "--pdp-atmosphere-color": getProductAtmosphere(product.color) } as CSSProperties}
    >
      <JsonLd data={structuredProduct} />
      <Section className="pt-8 sm:pt-12">
        <div className="grid gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-start lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 xl:gap-16">
          <ProductGallery images={gallery} key={product.slug} />

          <div className="reva-motion-enter min-w-0 space-y-5 lg:pt-2">
            <div className="reva-pdp-product-heading space-y-2 border-b border-reva-border/80 pb-4">
              {product.brand ? (
                <p className="text-xs text-reva-secondary">
                  <span className="font-medium uppercase tracking-[0.16em]">Marca:</span>{" "}
                  <span className="font-serif text-base font-medium tracking-normal">{product.brand}</span>
                </p>
              ) : null}
              <h1 className="font-serif text-4xl font-medium leading-[1.08] tracking-tight text-reva-primary sm:text-[2.75rem]">{product.title}</h1>
              <p className="reva-pdp-price pt-1 font-serif text-3xl font-semibold tabular-nums tracking-tight sm:text-[2rem]">Q {product.price.amount}</p>
            </div>

            <dl className="reva-pdp-facts grid grid-cols-2 gap-x-3 gap-y-3 border-b border-reva-border/80 pb-4 sm:gap-x-5">
              <div className="reva-pdp-fact">
                <dt className="text-sm text-reva-secondary">Talla</dt>
                <dd className="font-medium text-reva-primary">{product.sizeLabel ?? "Ver medidas"}</dd>
              </div>
              <div className="reva-pdp-fact">
                <dt className="text-sm text-reva-secondary">Condición</dt>
                <dd className="font-medium text-reva-primary">{conditionLabels[product.conditionRating]}</dd>
              </div>
              {product.measurements ? (
                <div className="col-span-2 text-xs leading-5 text-reva-secondary">
                  <dt className="inline font-medium text-reva-primary">Medidas</dt>
                  <dd className="inline">{`: ${Object.entries(product.measurements).map(([name, value]) => `${name}: ${value}`).join(" · ")}`}</dd>
                </div>
              ) : null}
              {conditionNote ? (
                <div className="col-span-2 text-sm leading-6 text-reva-primary">
                  <dt className="inline font-semibold">Detalle de condición</dt>
                  <dd className="inline">{`: ${conditionNote}`}</dd>
                </div>
              ) : null}
            </dl>

            <div className="reva-pdp-primary-action grid gap-3 sm:grid-cols-2 lg:sticky lg:top-24" id="pdp-primary-action">
              <Button className="w-full" href={`/checkout?product=${encodeURIComponent(product.slug)}`} variant="solid">Comprar ahora</Button>
              <AddToCartButton product={{ slug: product.slug, title: product.title }} />
            </div>

            <div className="space-y-4">
              <p className="reva-pdp-description max-w-prose text-sm leading-6 text-reva-secondary sm:text-justify">{product.description}</p>
              <dl className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
              <div>
                <dt className="text-sm text-reva-secondary">Tipo</dt>
                <dd className="mt-0.5 font-medium text-reva-primary">{garmentTypeLabel(product.garmentType)}</dd>
              </div>
              <div>
                <dt className="text-sm text-reva-secondary">Público</dt>
                <dd className="mt-0.5 font-medium text-reva-primary">{audienceLabel(product.audience)}</dd>
              </div>
              <div>
                <dt className="text-sm text-reva-secondary">Color</dt>
                <dd className="mt-0.5 font-medium text-reva-primary">{product.color ? colorLabel(product.color) : "No indicado"}</dd>
              </div>
              </dl>
            </div>

              <div className="space-y-3">
              <ProductContactCta product={{ canonicalUrl, price: `Q ${product.price.amount}`, title: product.title }} />
            </div>

            {product.materialDetails || product.measurements ? (
              <div className="space-y-2 border-t border-reva-border/80 pt-5 text-sm leading-6 text-reva-secondary">
                {product.materialDetails ? <p><span className="font-medium text-reva-primary">Material: </span>{product.materialDetails}</p> : null}
                {product.measurements ? <p><span className="font-medium text-reva-primary">Medidas: </span>{Object.entries(product.measurements).map(([name, value]) => `${name}: ${value}`).join(" · ")}</p> : null}
              </div>
            ) : null}

            <Button href="/catalogo">Volver al catálogo</Button>
          </div>
        </div>
        <PdpMobileStickyPurchase price={`Q ${product.price.amount}`} product={{ slug: product.slug, title: product.title }} />
      </Section>
    </main>
  );
}
