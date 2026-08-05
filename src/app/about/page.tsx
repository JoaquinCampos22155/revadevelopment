import Image from "next/image";
import type { Metadata } from "next";

import aboutIllustration from "@/assets/about-illustration.svg";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { aboutCollections, aboutTrustPoints } from "@/content/about";
import { CollectionCard } from "@/features/catalog/components/CollectionCard";

export const metadata: Metadata = {
  title: "Sobre REVA | Moda circular Guatemala",
  description:
    "Conoce REVA, una plataforma de moda circular en Guatemala que da una nueva vida a la ropa de segunda mano.",
};

/** Renders REVA's trust-building story and its path back to product discovery. */
export default function AboutPage() {
  return (
    <main id="main-content">
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <Text variant="label">Moda circular Guatemala</Text>
            <Heading level={1} variant="editorial">
              La ropa no debería terminar su historia en un clóset.
            </Heading>
            <Text className="text-lg" variant="body">
              REVA existe para hacer que descubrir ropa de segunda mano en Guatemala
              sea simple, confiable y deseable.
            </Text>
          </div>
          <Image
            alt="Ilustración editorial sobre la misión de REVA"
            className="w-full rounded-3xl"
            src={aboutIllustration}
          />
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <Text variant="label">Nuestra misión</Text>
            <Heading level={2} variant="editorial">
              Mantener prendas valiosas en circulación.
            </Heading>
          </div>
          <div className="space-y-5">
            <Text variant="body">
              La moda circular no busca hacer sentir culpa por comprar. Busca abrir
              una alternativa: extender la vida de una prenda, reducir desperdicio y
              descubrir estilo con más intención.
            </Text>
            <Text variant="quiet">
              En Guatemala, REVA conecta la curiosidad por la ropa usada con una
              experiencia digital más clara, cuidada y moderna.
            </Text>
          </div>
        </div>
      </Section>

      <Section>
        <div className="space-y-8">
          <div className="space-y-3">
            <Text variant="label">Por qué confiar</Text>
            <Heading level={2} variant="editorial">
              Una experiencia diseñada para reducir dudas.
            </Heading>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {aboutTrustPoints.map((point) => (
              <article
                className="space-y-3 rounded-2xl border border-cyan-100 bg-white p-6"
                key={point.title}
              >
                <h3 className="font-serif text-2xl">{point.title}</h3>
                <Text variant="quiet">{point.description}</Text>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="rounded-3xl bg-cyan-50 p-8 sm:p-12">
          <Text variant="label">Una comunidad que sigue creciendo</Text>
          <Heading className="mt-4 max-w-3xl" level={2} variant="editorial">
            REVA quiere que cada decisión de vestir también pueda sentirse como una
            nueva oportunidad.
          </Heading>
          <Text className="mt-4 max-w-2xl" variant="quiet">
            El futuro incluye donaciones, universidades y una comunidad que descubre,
            reutiliza y comparte. Hoy empezamos por hacer la exploración más accesible.
          </Text>
        </div>
      </Section>

      <Section>
        <div className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3">
              <Text variant="label">Colecciones destacadas</Text>
              <Heading level={2} variant="editorial">
                Sigue descubriendo en el catálogo.
              </Heading>
            </div>
            <Button href="/catalog">Ver catálogo</Button>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {aboutCollections.map((collection) => (
              <CollectionCard collection={collection} key={collection.title} />
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
