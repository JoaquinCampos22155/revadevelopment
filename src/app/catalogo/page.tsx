import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { catalogCategories, catalogProducts, catalogReviews } from "@/content/catalog";
import { CatalogProductCard } from "@/features/catalog/components/CatalogProductCard";
import { ReviewCard } from "@/features/catalog/components/ReviewCard";

export const metadata: Metadata = {
  title: "Catálogo | REVA",
  description: "Explora colecciones de moda circular en Guatemala con REVA.",
};

/** Combines REVA's approved editorial catalog hierarchy with trust-forward product cards. */
export default function CatalogPage() {
  return (
    <main id="main-content">
      <section className="bg-[#f4f7f8] py-12 sm:py-20">
        <PageContainer>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div className="space-y-5">
              <Text variant="label">Catálogo REVA</Text>
              <Heading className="max-w-3xl sm:text-6xl" level={1} variant="editorial">
                Piezas que merecen una segunda mirada.
              </Heading>
            </div>
            <Text className="max-w-md text-base" variant="body">
              Una selección de moda circular pensada para descubrir con calma, claridad y confianza.
            </Text>
          </div>
          <div aria-label="Categorías de catálogo" className="mt-10 flex flex-wrap gap-2">
            {catalogCategories.map((category, index) => (
              <span
                className={`rounded-full border px-4 py-2 text-sm ${index === 0 ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-700"}`}
                key={category}
              >
                {category}
              </span>
            ))}
          </div>
        </PageContainer>
      </section>

      <Section>
        <div className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3">
              <Text variant="label">Selección REVA</Text>
              <Heading level={2} variant="editorial">Descubre piezas con carácter.</Heading>
            </div>
            <p className="text-sm text-slate-500">{catalogProducts.length} piezas seleccionadas</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {catalogProducts.map((product) => (
              <CatalogProductCard key={product.href} product={product} />
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <Text variant="label">Confianza REVA</Text>
            <Heading level={2} variant="editorial">Una experiencia cuidada, de principio a fin.</Heading>
            <Text variant="quiet">
              Las reseñas aparecen después de descubrir las piezas, reduciendo incertidumbre antes del siguiente paso.
            </Text>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {catalogReviews.map((review) => <ReviewCard key={review.author} review={review} />)}
          </div>
        </div>
      </Section>

      <Section>
        <div className="rounded-3xl bg-slate-950 p-8 text-center text-white sm:p-12">
          <Text className="text-sky-200" variant="label">Una prenda puede empezar de nuevo</Text>
          <Heading className="mx-auto mt-4 max-w-2xl" level={2} variant="editorial">
            ¿Quieres saber más sobre REVA?
          </Heading>
          <div className="mt-6">
            <Button className="bg-white text-slate-950 hover:bg-sky-100" href="/contacto">
              Contactar a REVA
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
