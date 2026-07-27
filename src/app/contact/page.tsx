import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Contacto | REVA",
  description:
    "Conoce cómo REVA abrirá conversaciones para descubrir moda circular en Guatemala.",
};

/** Renders a trust-first contact experience until REVA's official channel is configured. */
export default function ContactPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Section>
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <Text variant="label">Contacto REVA</Text>
          <Heading level={1} variant="editorial">
            Las mejores conversaciones empiezan descubriendo.
          </Heading>
          <Text className="text-lg" variant="body">
            REVA está construyendo una forma cercana y confiable de conectar
            contigo cuando encuentres una prenda que te interese.
          </Text>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl rounded-3xl bg-cyan-50 p-8 text-center sm:p-12">
          <Text variant="label">Nuestro canal oficial</Text>
          <Heading className="mt-4" level={2} variant="editorial">
            REVA abrirá una conversación directa contigo.
          </Heading>
          <Text className="mx-auto mt-4 max-w-2xl" variant="quiet">
            Cuando nuestro canal oficial esté listo, los detalles de cada
            prenda te llevarán allí para resolver dudas y continuar tu compra.
            Por ahora, explora las colecciones y conoce nuestra misión.
          </Text>
          <Button className="mt-6" href="/catalog" variant="solid">
            Explorar catálogo
          </Button>
        </div>
      </Section>
    </main>
  );
}
