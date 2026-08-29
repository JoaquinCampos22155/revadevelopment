import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { getWhatsAppSellingUrl } from "@/infrastructure/config/site-contact";

export const metadata: Metadata = {
  title: "Vender ropa usada | REVA",
  description: "Conoce cómo iniciar una conversación para vender ropa usada o prendas de segunda mano con REVA.",
  alternates: { canonical: "/vender" },
};

const steps = [["Comparte tu prenda", "Cuéntanos sobre la prenda que te interesa ofrecer a REVA."], ["REVA la revisa", "Revisamos la información para indicarte cómo continuar."], ["Te indicamos el siguiente paso", "Te acompañamos con claridad antes de avanzar."]] as const;

/** Explains the approved selling entry point without creating an Intake or public promise. */
export default function SellPage() {
  const whatsappUrl = getWhatsAppSellingUrl();
  return <main id="main-content"><section className="bg-[#dceef6] py-12 sm:py-16 lg:py-20"><PageContainer><div className="max-w-3xl space-y-7"><Text className="text-[#1461a4]" variant="label">Ofrece una prenda a REVA</Text><Heading className="text-[#10233d] sm:text-6xl" level={1} variant="editorial">Dale a una prenda la oportunidad de seguir circulando.</Heading><Text className="max-w-2xl text-lg text-[#39556d]" variant="body">Si tienes una prenda que te gustaría vender, podemos explicarte cómo iniciar el proceso con REVA.</Text>{whatsappUrl ? <Button href={whatsappUrl} variant="solid">Quiero vender una prenda</Button> : <p className="text-sm text-[#52677c]">El canal para iniciar este proceso estará disponible próximamente.</p>}</div></PageContainer></section><Section><div className="border-y border-[#c7ddeb] py-8 sm:py-10"><Text className="text-[#1461a4]" variant="label">Cómo empieza</Text><ol className="mt-7 grid gap-8 md:grid-cols-3">{steps.map(([title, description], index) => <li className="space-y-3" key={title}><span className="font-serif text-3xl text-[#1461a4]">0{index + 1}</span><h2 className="font-serif text-2xl tracking-tight text-[#10233d]">{title}</h2><Text className="text-[#52677c]" variant="quiet">{description}</Text></li>)}</ol></div></Section><section className="bg-[#ede0cc] py-12 sm:py-16"><PageContainer><div className="grid gap-7 sm:grid-cols-[0.85fr_1.15fr]"><div className="space-y-3"><Text className="text-[#1461a4]" variant="label">Qué debes saber</Text><Heading className="text-[#10233d]" level={2} variant="editorial">Cada prenda se considera de forma individual.</Heading></div><Text className="text-[#39556d]" variant="body">REVA revisa la información antes de indicar el siguiente paso. Las condiciones específicas del proceso se comparten antes de avanzar.</Text></div></PageContainer></section><Section><div className="max-w-2xl space-y-4"><Text className="text-[#1461a4]" variant="label">¿Listo para empezar?</Text><Heading className="text-[#10233d]" level={2} variant="editorial">Conversemos sobre tu prenda.</Heading>{whatsappUrl ? <Button href={whatsappUrl} variant="solid">Quiero vender una prenda</Button> : <p className="text-sm text-[#52677c]">El canal de contacto se habilitará próximamente.</p>}</div></Section></main>;
}
