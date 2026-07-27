import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import {
  catalogCategories,
  catalogCollections,
  catalogReviews,
} from "@/content/catalog";
import { CollectionCard } from "@/features/catalog/components/CollectionCard";
import { ReviewCard } from "@/features/catalog/components/ReviewCard";

export const metadata: Metadata = {
  title: "Catálogo | REVA",
  description: "Explora colecciones de moda circular en Guatemala con REVA.",
};

/** Renders REVA's data-ready catalog browsing foundation. */
export default function CatalogPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Section>
        <div className="space-y-6">
          <Text variant="label">Catálogo REVA</Text>
          <Heading className="max-w-3xl" level={1} variant="editorial">
            Descubre prendas que todavía tienen mucho que contar.
          </Heading>
          <Text className="max-w-2xl text-lg" variant="body">
            Nuestro catálogo reúne colecciones seleccionadas para seguir
            circulando con estilo y confianza.
          </Text>
          <nav aria-label="Explorar categorías" className="flex flex-wrap gap-3">
            {catalogCategories.map((category) => (
              <span
                className="rounded-full border border-sky-200 bg-white px-4 py-2 text-sm text-slate-700"
                key={category}
              >
                {category}
              </span>
            ))}
          </nav>
          <Button href="/catalog/chaqueta-denim-clasica">
            Explorar una ficha de prenda
          </Button>
        </div>
      </Section>

      <Section>
        <div className="space-y-8">
          <div className="space-y-3">
            <Text variant="label">Explora por colección</Text>
            <Heading level={2} variant="editorial">
              Una selección para seguir descubriendo.
            </Heading>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {catalogCollections.map((collection) => (
              <CollectionCard collection={collection} key={collection.title} />
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="rounded-3xl border border-dashed border-sky-200 bg-sky-50 p-8 text-center sm:p-12">
          <Text variant="label">Descubre con intención</Text>
          <Heading className="mx-auto mt-4 max-w-2xl" level={2} variant="editorial">
            Cada selección abre una nueva historia.
          </Heading>
          <Text className="mx-auto mt-4 max-w-xl" variant="quiet">
            Explora estas colecciones editoriales y vuelve a descubrir la moda
            de segunda mano desde otra perspectiva.
          </Text>
        </div>
      </Section>

      <Section>
        <div className="space-y-8">
          <div className="space-y-3">
            <Text variant="label">Confianza REVA</Text>
            <Heading level={2} variant="editorial">
              Una experiencia que invita a seguir explorando.
            </Heading>
            <Text className="max-w-2xl" variant="quiet">
              Las reseñas aparecen después de la exploración editorial y antes
              del siguiente paso, para reducir incertidumbre sin interrumpir el
              descubrimiento.
            </Text>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {catalogReviews.map((review) => (
              <ReviewCard review={review} key={review.author} />
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="rounded-3xl bg-slate-950 p-8 text-center text-white sm:p-12">
          <Text className="text-sky-200" variant="label">
            Una prenda puede empezar de nuevo
          </Text>
          <Heading className="mx-auto mt-4 max-w-2xl" level={2} variant="editorial">
            ¿Quieres saber más sobre REVA?
          </Heading>
          <div className="mt-6">
            <Button className="bg-white text-slate-950 hover:bg-sky-100" href="/contact">
              Contactar a REVA
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
