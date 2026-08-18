import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { ProductDraftForm } from "@/features/product-manager/components/ProductDraftForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Registrar prenda | Administración REVA",
  robots: { follow: false, index: false },
};

function getGuatemalaToday(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Guatemala",
    year: "numeric",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${value.year}-${value.month}-${value.day}`;
}

/** Starts the one operational flow that atomically registers Intake and a Product draft. */
export default function NewProductDraftPage() {
  return (
    <main id="main-content">
      <Section>
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-3">
            <Text variant="label">Product Manager</Text>
            <Heading level={1} variant="editorial">Registrar nueva prenda</Heading>
            <Text variant="body">Primero registramos cómo llegó a REVA. Luego completarás su borrador de producto.</Text>
          </div>
          <ProductDraftForm today={getGuatemalaToday()} />
        </div>
      </Section>
    </main>
  );
}
