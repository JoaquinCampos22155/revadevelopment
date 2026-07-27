import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import {
  collectionPreviews,
  homeHighlights,
  howItWorksSteps,
} from "@/content/home";
import { CollectionPreviewCard } from "@/features/home/components/CollectionPreviewCard";

export const metadata: Metadata = {
  title: "REVA | Moda circular en Guatemala",
  description:
    "Descubre moda circular en Guatemala y dale una nueva vida a prendas con valor.",
};

/** Renders REVA's first production home page. */
export default function Home() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-7">
            <Text variant="label">Moda circular en Guatemala</Text>
            <Heading className="max-w-3xl" level={1} variant="editorial">
              Prendas con historia. Estilo con futuro.
            </Heading>
            <Text className="max-w-2xl text-lg" variant="body">
              REVA hace que descubrir, reutilizar y conectar con moda de segunda
              mano se sienta simple, confiable y deseable.
            </Text>
            <div className="flex flex-wrap gap-3">
              <Button href="/catalog" variant="solid">
                Explorar catálogo
              </Button>
              <Button href="#como-funciona">Cómo funciona</Button>
            </div>
          </div>

          <aside className="space-y-5 rounded-3xl bg-sky-100 p-8 sm:p-10">
            <Text variant="label">REVA selecciona</Text>
            <Heading level={2} variant="editorial">
              Un catálogo creado para seguir explorando.
            </Heading>
            <Text variant="quiet">
              Cada colección reúne piezas elegidas por su historia, estilo y
              potencial para seguir circulando.
            </Text>
          </aside>
        </div>
      </Section>

      <Section>
        <div className="space-y-8">
          <div className="space-y-3">
            <Text variant="label">Colecciones destacadas</Text>
            <Heading level={2} variant="editorial">
              Encuentra una historia para vestir.
            </Heading>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {collectionPreviews.map((collection) => (
              <CollectionPreviewCard collection={collection} key={collection.title} />
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <Text variant="label">Por qué REVA</Text>
            <Heading level={2} variant="editorial">
              Vestirse bien también puede extender la vida de una prenda.
            </Heading>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {homeHighlights.map((highlight) => (
              <article className="space-y-3" key={highlight.title}>
                <h3 className="font-serif text-2xl tracking-tight">{highlight.title}</h3>
                <Text variant="quiet">{highlight.description}</Text>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="space-y-8" id="como-funciona">
          <div className="space-y-3">
            <Text variant="label">Cómo funciona</Text>
            <Heading level={2} variant="editorial">
              Descubrir una segunda vida empieza aquí.
            </Heading>
          </div>
          <ol className="grid gap-5 md:grid-cols-3">
            {howItWorksSteps.map((step, index) => (
              <li
                className="space-y-4 rounded-2xl border border-sky-100 bg-sky-50 p-6"
                key={step.title}
              >
                <span className="font-serif text-3xl text-sky-700">0{index + 1}</span>
                <h3 className="font-serif text-2xl tracking-tight">{step.title}</h3>
                <Text variant="quiet">{step.description}</Text>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section>
        <div className="grid gap-8 rounded-3xl bg-slate-950 p-8 text-white sm:p-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-4">
            <Text className="text-sky-200" variant="label">
              Sobre REVA
            </Text>
            <Heading className="max-w-2xl" level={2} variant="editorial">
              Una nueva forma de darle valor a lo que ya existe.
            </Heading>
            <Text className="max-w-2xl text-sky-100" variant="body">
              Somos una iniciativa guatemalteca que busca hacer la moda circular
              más accesible, cercana y atractiva.
            </Text>
          </div>
          <Button className="self-start bg-white text-slate-950 hover:bg-sky-100" href="/about">
            Conocer REVA
          </Button>
        </div>
      </Section>

      <Section>
        <div className="space-y-6 text-center">
          <Text variant="label">Tu próxima prenda puede tener otra vida</Text>
          <Heading className="mx-auto max-w-2xl" level={2} variant="editorial">
            Explora REVA y descubre lo que sigue.
          </Heading>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/catalog" variant="solid">
              Ver catálogo
            </Button>
            <Button href="/contact">Contactar a REVA</Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
