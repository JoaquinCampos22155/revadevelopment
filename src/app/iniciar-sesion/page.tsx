import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Tu cuenta | REVA",
  description: "Conoce las futuras funciones de cuenta de REVA.",
  robots: { follow: false, index: false },
};

/**
 * Gives the existing account CTA an intentional destination while authentication remains outside the MVP.
 * It sets the expectation for future value without imitating a login flow that does not exist yet.
 */
export default function LoginPage() {
  return (
    <main id="main-content">
      <Section>
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <Text variant="label">Tu cuenta REVA</Text>
          <Heading level={1} variant="editorial">Más formas de descubrir, muy pronto.</Heading>
          <Text className="text-lg" variant="body">
            En una próxima etapa, tu cuenta te permitirá guardar favoritos, recibir recomendaciones y conectar mejor con la comunidad REVA.
          </Text>
          <Button href="/catalogo" variant="solid">Explorar catálogo</Button>
        </div>
      </Section>
    </main>
  );
}
