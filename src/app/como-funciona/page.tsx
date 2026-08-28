import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = { title: "Cómo funciona REVA | Moda circular Guatemala", description: "Conoce cómo REVA hace que descubrir y dar continuidad a prendas se sienta claro y cuidado.", alternates: { canonical: "/como-funciona" } };

/** Provides the single truthful institutional explanation without duplicating selling or donation journeys. */
export default function HowItWorksPage() {
  return <main id="main-content"><Section><div className="max-w-3xl space-y-6 py-4 sm:py-10"><Text variant="label">Cómo funciona REVA</Text><Heading className="sm:text-6xl" level={1} variant="editorial">Una nueva oportunidad para prendas que todavía tienen valor.</Heading><Text className="max-w-2xl text-lg" variant="body">REVA hace que explorar moda circular en Guatemala se sienta simple, confiable y deseable.</Text></div></Section><Section><div className="grid gap-10 md:grid-cols-3"><article className="space-y-3"><Text variant="label">01</Text><Heading level={2} variant="editorial">Descubre</Heading><Text variant="quiet">Explora prendas publicadas con información clara, fotografías y detalles para decidir con calma.</Text></article><article className="space-y-3"><Text variant="label">02</Text><Heading level={2} variant="editorial">Da continuidad</Heading><Text variant="quiet">Una prenda puede volver a formar parte de otra historia cuando sigue circulando.</Text></article><article className="space-y-3"><Text variant="label">03</Text><Heading level={2} variant="editorial">Conecta</Heading><Text variant="quiet">REVA busca acercar una experiencia más cuidada y clara alrededor de la moda de segunda mano.</Text></article></div></Section><Section><div className="max-w-2xl space-y-3 border-y border-slate-200 py-8 sm:py-10"><Text variant="label">Por qué REVA</Text><Heading level={2} variant="editorial">Circularidad con intención.</Heading><Text variant="quiet">La propuesta es simple: descubrir prendas con carácter y ofrecer una forma consciente de mantenerlas en circulación.</Text></div></Section></main>;
}
