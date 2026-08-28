import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { getWhatsAppSellingUrl } from "@/infrastructure/config/site-contact";

export const metadata: Metadata = {
  title: "Vender una prenda | REVA",
  description: "Conoce cómo empezar a ofrecer una prenda a REVA.",
  alternates: { canonical: "/vender" },
};

const steps = [
  ["Comparte tu prenda", "Cuéntanos sobre la prenda que te interesa ofrecer a REVA."],
  ["REVA la revisa", "Revisamos la información para indicarte cómo continuar."],
  ["Te indicamos el siguiente paso", "Te acompañamos con claridad antes de avanzar."],
] as const;

/** Explains the approved selling entry point without creating an Intake or public promise. */
export default function SellPage() {
  const whatsappUrl = getWhatsAppSellingUrl();

  return (
    <main id="main-content">
      <Section>
        <div className="max-w-4xl space-y-7 py-4 sm:py-10">
          <Text variant="label">Ofrece una prenda a REVA</Text>
          <Heading className="max-w-4xl sm:text-6xl" level={1} variant="editorial">Dale a una prenda la oportunidad de seguir circulando.</Heading>
          <Text className="max-w-2xl text-lg" variant="body">Si tienes una prenda que te gustaría ofrecer, podemos explicarte cómo iniciar el proceso con REVA.</Text>
          {whatsappUrl ? <Button href={whatsappUrl} variant="solid">Quiero vender una prenda</Button> : <p className="text-sm text-slate-600">El canal para iniciar este proceso estará disponible próximamente.</p>}
        </div>
      </Section>

      <Section>
        <div className="border-y border-slate-200 py-8 sm:py-10">
          <Text variant="label">Cómo empieza</Text>
          <ol className="mt-7 grid gap-8 md:grid-cols-3">
            {steps.map(([title, description], index) => <li className="space-y-3" key={title}>
              <span className="font-serif text-3xl text-cyan-800">0{index + 1}</span>
              <h2 className="font-serif text-2xl tracking-tight text-slate-950">{title}</h2>
              <Text variant="quiet">{description}</Text>
            </li>)}
          </ol>
        </div>
      </Section>

      <Section>
        <div className="grid gap-7 sm:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-3"><Text variant="label">Qué debes saber</Text><Heading level={2} variant="editorial">Cada prenda se considera de forma individual.</Heading></div>
          <Text variant="body">REVA revisa la información antes de indicar el siguiente paso. Las condiciones específicas del proceso se comparten antes de avanzar.</Text>
        </div>
      </Section>

      <Section>
        <div className="border-t border-slate-200 pt-8"><Text variant="label">¿Listo para empezar?</Text><Heading className="mt-3 max-w-2xl" level={2} variant="editorial">Conversemos sobre tu prenda.</Heading><div className="mt-6">{whatsappUrl ? <Button href={whatsappUrl} variant="solid">Quiero vender una prenda</Button> : <p className="text-sm text-slate-600">El canal de contacto se habilitará próximamente.</p>}</div></div>
      </Section>
    </main>
  );
}
