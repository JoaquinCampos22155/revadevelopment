import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Donar ropa | REVA",
  description: "Conoce cómo iniciar una conversación para donar ropa y prendas a REVA.",
  alternates: { canonical: "/donar" },
};

const steps = [["Comparte tu intención", "Cuéntanos que te gustaría donar prendas a REVA."], ["REVA revisa la información", "Revisamos lo que compartes para indicarte cómo continuar."], ["Te indicamos el siguiente paso", "Antes de avanzar, te explicamos el proceso disponible."]] as const;

/** Explains donation as a distinct truthful path without inventing operational commitments. */
export default function DonatePage() {
  return <main id="main-content"><section className="bg-[#ede0cc] py-12 sm:py-16 lg:py-20"><PageContainer><div className="max-w-3xl space-y-7"><Text className="text-[#1461a4]" variant="label">Donar prendas a REVA</Text><Heading className="text-[#10233d] sm:text-6xl" level={1} variant="editorial">Una prenda puede seguir aportando.</Heading><Text className="max-w-2xl text-lg text-[#39556d]" variant="body">Si deseas donar prendas, REVA puede explicarte cómo iniciar la conversación.</Text><Button href="/contacto" variant="outline">Conocer canales de contacto</Button></div></PageContainer></section><Section><div className="border-y border-[#c7ddeb] py-8 sm:py-10"><Text className="text-[#1461a4]" variant="label">Cómo empieza</Text><ol className="mt-7 grid gap-8 md:grid-cols-3">{steps.map(([title, description], index) => <li className="space-y-3" key={title}><span className="font-serif text-3xl text-[#1461a4]">0{index + 1}</span><h2 className="font-serif text-2xl tracking-tight text-[#10233d]">{title}</h2><Text className="text-[#52677c]" variant="quiet">{description}</Text></li>)}</ol></div></Section><section className="bg-[#dceef6] py-12 sm:py-16"><PageContainer><div className="max-w-2xl space-y-4"><Text className="text-[#1461a4]" variant="label">Qué debes saber</Text><Heading className="text-[#10233d]" level={2} variant="editorial">Cada conversación se considera de forma individual.</Heading><Text className="text-[#39556d]" variant="body">Las condiciones específicas se comparten antes de avanzar. REVA no publica compromisos de logística, aceptación o destino sin una política aprobada.</Text></div></PageContainer></section></main>;
}
