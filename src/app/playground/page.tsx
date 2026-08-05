import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Laboratorio UI | REVA",
  robots: { follow: false, index: false },
};

/** Reserves a deliberately small internal route for future UI experiments outside the public experience. */
export default function DesignPlayground() {
  return (
    <main id="main-content">
      <Section>
        <div className="max-w-2xl space-y-4">
          <Text variant="label">Uso interno</Text>
          <Heading level={1} variant="editorial">Laboratorio de interfaz REVA</Heading>
          <Text variant="body">
            Esta ruta está reservada para evaluar futuras decisiones de interfaz. No forma parte de la experiencia pública ni del flujo de compra.
          </Text>
        </div>
      </Section>
    </main>
  );
}
