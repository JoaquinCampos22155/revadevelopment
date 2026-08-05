import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { catalogReviews } from "@/content/catalog";
import { findProductBySlug, productDetails } from "@/content/products";
import { ProductContactCta } from "@/features/catalog/components/ProductContactCta";
import { ProductGallery } from "@/features/catalog/components/ProductGallery";
import { ProductRecommendationCard } from "@/features/catalog/components/ProductRecommendationCard";
import { ReviewCard } from "@/features/catalog/components/ReviewCard";

type ProductPageProps = Readonly<{ params: Promise<{ slug: string }> }>;

/** Generates static paths so each editorial product detail remains crawlable. */
export function generateStaticParams() {
  return productDetails.map((product) => ({ slug: product.slug }));
}

/** Creates product-specific metadata from the same source as the visible page content. */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductBySlug(slug);

  if (!product) return {};

  return {
    title: `${product.name} | REVA`,
    description: `${product.name}: ${product.category} de ${product.brand}. Conoce su condición, talla y detalles en REVA.`,
  };
}

/** Renders an editorial product detail designed to answer confidence questions before contact. */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = findProductBySlug(slug);

  if (!product) notFound();

  return (
    <main id="main-content">
      <Section>
        <div className="mb-8">
          <Button href="/catalog">Volver al catálogo</Button>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <ProductGallery images={product.gallery} />
          <div className="space-y-7 lg:sticky lg:top-24">
            <div className="space-y-4">
              <Text variant="label">Selección editorial REVA</Text>
              <Heading level={1} variant="editorial">
                {product.name}
              </Heading>
              <Text className="text-lg" variant="body">
                {product.description}
              </Text>
            </div>
            <dl className="grid grid-cols-2 gap-4 border-y border-sky-100 py-6">
              <div><dt className="text-sm text-slate-500">Marca</dt><dd className="mt-1 font-medium">{product.brand}</dd></div>
              <div><dt className="text-sm text-slate-500">Categoría</dt><dd className="mt-1 font-medium">{product.category}</dd></div>
              <div><dt className="text-sm text-slate-500">Talla</dt><dd className="mt-1 font-medium">{product.size}</dd></div>
              <div><dt className="text-sm text-slate-500">Condición</dt><dd className="mt-1 font-medium">{product.condition}</dd></div>
            </dl>
            <ProductContactCta />
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <Text variant="label">Por qué destaca</Text>
            <Heading level={2} variant="editorial">Detalles que ayudan a elegir con confianza.</Heading>
          </div>
          <ul className="space-y-3">
            {product.highlights.map((highlight) => <li className="rounded-2xl bg-sky-50 px-5 py-4 text-slate-700" key={highlight}>{highlight}</li>)}
          </ul>
        </div>
      </Section>

      <Section>
        <div className="space-y-6">
          <Text variant="label">También puedes explorar</Text>
          <Heading level={2} variant="editorial">Colecciones relacionadas</Heading>
          <div className="flex flex-wrap gap-3">
            {product.relatedCollections.map((collection) => <Button href="/catalog" key={collection}>{collection}</Button>)}
          </div>
        </div>
      </Section>

      <Section>
        <div className="space-y-8">
          <div className="space-y-3"><Text variant="label">Sigue descubriendo</Text><Heading level={2} variant="editorial">Otras piezas que podrían gustarte.</Heading></div>
          <div className="grid gap-5 md:grid-cols-3">{product.recommendations.map((recommendation) => <ProductRecommendationCard key={recommendation.slug} recommendation={recommendation} />)}</div>
        </div>
      </Section>

      <Section>
        <div className="space-y-8"><div className="space-y-3"><Text variant="label">Confianza REVA</Text><Heading level={2} variant="editorial">Una experiencia cuidada, de principio a fin.</Heading></div><div className="grid gap-5 md:grid-cols-3">{catalogReviews.map((review) => <ReviewCard key={review.author} review={review} />)}</div></div>
      </Section>
    </main>
  );
}
