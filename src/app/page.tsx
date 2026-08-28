import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { toCatalogProductPreview } from "@/features/catalog/public-product.presentation";
import { createPublicProductService } from "@/features/catalog/server/public-product.service";
import { HomeRecommendedProductCard } from "@/features/home/components/HomeRecommendedProductCard";

export const metadata: Metadata = {
  title: "REVA | Moda circular en Guatemala",
  description: "Descubre moda circular en Guatemala y dale una nueva vida a prendas con valor.",
};

/** Orients visitors, exposes curated real inventory, and routes each garment journey without duplicating their pages. */
export default async function Home() {
  const recommended = (await (await createPublicProductService()).listRecommended())
    .map(toCatalogProductPreview)
    .filter((product): product is NonNullable<typeof product> => product !== null)
    .slice(0, 4);

  return <main id="main-content">
    <Section><div className="max-w-3xl space-y-7 py-4 sm:py-10"><Text variant="label">Moda circular en Guatemala</Text><Heading className="max-w-3xl sm:text-6xl" level={1} variant="editorial">Prendas con historia. Estilo con futuro.</Heading><Text className="max-w-2xl text-lg" variant="body">Descubre piezas seleccionadas para seguir circulando con intención.</Text><Button href="/catalogo" variant="solid">Explorar prendas</Button></div></Section>
    {recommended.length ? <Section><div className="space-y-5"><div className="flex items-end justify-between gap-4"><div><Text variant="label">Recomendado por REVA</Text><Heading className="mt-2" level={2} variant="editorial">Piezas para descubrir primero.</Heading></div><Button href="/catalogo" variant="outline">Ver catálogo</Button></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{recommended.map((product) => <HomeRecommendedProductCard key={product.href} product={product} />)}</div></div></Section> : null}
    <Section><div className="grid gap-6 border-y border-slate-200 py-8 sm:grid-cols-2 sm:gap-10 sm:py-10"><div className="space-y-3"><Text variant="label">¿Tienes prendas que ya no usas?</Text><Heading level={2} variant="editorial">Elige cómo quieres que sigan circulando.</Heading></div><div className="flex flex-wrap content-end gap-3 sm:justify-self-end"><Button href="/vender" variant="outline">Vender</Button><Button href="/donar" variant="outline">Donar</Button></div></div></Section>
    <Section><div className="max-w-2xl space-y-3"><Text variant="label">REVA</Text><Heading level={2} variant="editorial">Moda circular clara, cuidada y cercana.</Heading><Text variant="quiet">Una forma más simple de descubrir prendas con valor y darles una nueva oportunidad.</Text></div></Section>
  </main>;
}
