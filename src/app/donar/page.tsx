import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = { title: "Donar prendas | REVA", description: "Conoce cómo iniciar una conversación para donar prendas a REVA.", alternates: { canonical: "/donar" } };

const steps = [["Comparte tu intención", "Cuéntanos que te gustaría donar prendas a REVA."], ["REVA revisa la información", "Revisamos lo que compartes para indicarte cómo continuar."], ["Te indicamos el siguiente paso", "Antes de avanzar, te explicamos el proceso disponible."]] as const;

/** Explains donation as a distinct truthful path without inventing operational commitments. */
export default function DonatePage() { return <main id="main-content"><Section><div className="max-w-3xl space-y-7 py-4 sm:py-10"><Text variant="label">Donar prendas a REVA</Text><Heading className="sm:text-6xl" level={1} variant="editorial">Una prenda puede seguir aportando.</Heading><Text className="max-w-2xl text-lg" variant="body">Si deseas donar prendas, REVA puede explicarte cómo iniciar la conversación.</Text></div></Section><Section><div className="border-y border-slate-200 py-8 sm:py-10"><Text variant="label">Cómo empieza</Text><ol className="mt-7 grid gap-8 md:grid-cols-3">{steps.map(([title, description], index) => <li className="space-y-3" key={title}><span className="font-serif text-3xl text-cyan-800">0{index + 1}</span><h2 className="font-serif text-2xl tracking-tight text-slate-950">{title}</h2><Text variant="quiet">{description}</Text></li>)}</ol></div></Section><Section><div className="max-w-2xl space-y-4"><Text variant="label">Qué debes saber</Text><Heading level={2} variant="editorial">Cada conversación se considera de forma individual.</Heading><Text variant="quiet">Las condiciones específicas se comparten antes de avanzar. REVA no publica compromisos de logística, aceptación o destino sin una política aprobada.</Text><Button href="/contacto" variant="outline">Conocer canales de contacto</Button></div></Section></main>; }
