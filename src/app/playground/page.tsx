import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Design Playground | REVA",
  description: "Exploración interna de la fundación visual de REVA.",
  robots: {
    follow: false,
    index: false,
  },
};

const colorDirections = [
  {
    name: "A — Tierra",
    colors: ["bg-stone-950", "bg-stone-500", "bg-amber-100"],
  },
  {
    name: "B — Botánica",
    colors: ["bg-emerald-950", "bg-emerald-600", "bg-lime-100"],
  },
  {
    name: "C — Editorial",
    colors: ["bg-neutral-950", "bg-neutral-500", "bg-rose-100"],
  },
];

/** Renders the temporary surface used to compare REVA UI directions. */
export default function DesignPlayground() {
  return (
    <main className="min-h-screen bg-stone-50 text-neutral-950">
      <Section>
        <div className="space-y-4">
          <Text variant="label">REVA / Design Playground</Text>
          <Heading level={1} variant="clean">
            Exploración visual, no sistema final.
          </Heading>
          <Text className="max-w-2xl" variant="quiet">
            Este espacio compara decisiones reutilizables antes de convertirlas
            en estándares de producto.
          </Text>
        </div>
      </Section>

      <Section>
        <div className="space-y-8">
          <div className="space-y-2">
            <Text variant="label">Tipografía</Text>
            <Heading level={2}>Tres direcciones para comparar</Heading>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <article className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
              <Text variant="label">A — Editorial</Text>
              <Heading level={3} variant="editorial">
                Cada prenda tiene otra vida.
              </Heading>
              <Text variant="quiet">
                Una voz más cálida y narrativa para moda circular.
              </Text>
            </article>
            <article className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
              <Text variant="label">B — Limpia</Text>
              <Heading level={3} variant="clean">
                Cada prenda tiene otra vida.
              </Heading>
              <Text variant="quiet">
                Una dirección moderna, directa y altamente legible.
              </Text>
            </article>
            <article className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
              <Text variant="label">C — Compacta</Text>
              <Heading level={3} variant="compact">
                Cada prenda tiene otra vida.
              </Heading>
              <Text variant="quiet">
                Una opción más gráfica para etiquetas y momentos de énfasis.
              </Text>
            </article>
          </div>
        </div>
      </Section>

      <Section>
        <div className="space-y-8">
          <div className="space-y-2">
            <Text variant="label">Acciones</Text>
            <Heading level={2}>Tres expresiones de botón</Heading>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="solid">A — Sólido</Button>
            <Button variant="outline">B — Contorno</Button>
            <Button variant="soft">C — Suave</Button>
          </div>
        </div>
      </Section>

      <Section>
        <div className="space-y-8">
          <div className="space-y-2">
            <Text variant="label">Color</Text>
            <Heading level={2}>Direcciones para explorar</Heading>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {colorDirections.map((direction) => (
              <article
                className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6"
                key={direction.name}
              >
                <Text variant="label">{direction.name}</Text>
                <div className="flex gap-2">
                  {direction.colors.map((color) => (
                    <div
                      aria-label={color}
                      className={`h-16 flex-1 rounded-xl ${color}`}
                      key={color}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <Text variant="label">Forma y elevación</Text>
            <Heading level={2}>Radio y sombra</Heading>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-md bg-white p-5 shadow-sm">Radio A</div>
              <div className="rounded-xl bg-white p-5 shadow-md">Radio B</div>
              <div className="rounded-3xl bg-white p-5 shadow-lg">Radio C</div>
            </div>
          </div>
          <div className="space-y-5">
            <Text variant="label">Ritmo</Text>
            <Heading level={2}>Escala de espaciado</Heading>
            <div className="space-y-2 rounded-2xl bg-white p-6 shadow-sm">
              <div className="h-2 w-8 rounded-full bg-neutral-950" />
              <div className="h-2 w-16 rounded-full bg-neutral-950" />
              <div className="h-2 w-24 rounded-full bg-neutral-950" />
              <div className="h-2 w-32 rounded-full bg-neutral-950" />
            </div>
          </div>
        </div>
      </Section>

      <footer className="border-t border-neutral-200 py-8">
        <PageContainer>
          <Text variant="quiet">
            Página temporal de exploración. Ninguna alternativa está aprobada
            todavía.
          </Text>
        </PageContainer>
      </footer>
    </main>
  );
}
