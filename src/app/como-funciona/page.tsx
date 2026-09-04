import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Cómo funciona REVA | Moda circular",
  description: "Conoce el modelo de REVA para descubrir y dar continuidad a prendas de segunda mano.",
  alternates: { canonical: "/como-funciona" },
};

const modelSteps = [
  ["Las prendas llegan a REVA", "Una prenda puede entrar por una vía de venta o donación."],
  ["La información se prepara", "Cada pieza se registra, se describe y se presenta con fotografías y detalles."],
  ["La prenda vuelve a descubrirse", "Cuando está lista, puede explorarse públicamente para iniciar una nueva historia."],
] as const;

/** Explains the verified REVA model without exposing operational terminology or inventing business policy. */
export default function HowItWorksPage() {
  return <main id="main-content"><section className="bg-reva-muted py-12 sm:py-16 lg:py-20"><PageContainer><div className="max-w-3xl space-y-6"><Text className="text-reva-brand-strong" variant="label">Cómo funciona REVA</Text><Heading className="text-reva-primary sm:text-6xl" level={1} variant="editorial">Una nueva oportunidad para prendas que todavía tienen valor.</Heading><Text className="max-w-2xl text-lg text-reva-secondary" variant="body">REVA reúne moda de segunda mano y una experiencia digital cuidada para que descubrir prendas se sienta claro, confiable y deseable.</Text><Button href="/catalogo" variant="solid">Explorar prendas</Button></div></PageContainer></section><Section><div className="grid gap-10 md:grid-cols-3">{modelSteps.map(([title, description], index) => <article className="space-y-4" key={title}><Text className="text-reva-brand-strong" variant="label">0{index + 1}</Text><Heading className="text-reva-primary" level={2} variant="editorial">{title}</Heading><Text className="text-reva-secondary" variant="body">{description}</Text></article>)}</div></Section><section className="bg-reva-strong py-12 sm:py-16"><PageContainer><div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"><div><Text className="text-reva-brand-strong" variant="label">Una experiencia para mirar con calma</Text><Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Información, fotografías y detalles para decidir mejor.</Heading></div><Text className="max-w-xl text-reva-secondary" variant="body">Cada Producto publicado reúne hechos relevantes como talla, condición, medidas y descripción cuando están disponibles. REVA busca reducir incertidumbre antes de que una persona decida expresar interés.</Text></div></PageContainer></section><Section><div className="max-w-2xl space-y-4"><Text className="text-reva-brand-strong" variant="label">Por qué REVA</Text><Heading className="text-reva-primary" level={2} variant="editorial">Circularidad con intención.</Heading><Text className="text-reva-secondary" variant="body">La propuesta es simple: dar visibilidad a prendas con valor y presentarlas de una manera más clara, cuidada y cercana.</Text></div></Section></main>;
}
