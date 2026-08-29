import Image from "next/image";
import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { toCatalogProductPreview } from "@/features/catalog/public-product.presentation";
import { createPublicProductService } from "@/features/catalog/server/public-product.service";
import { HomeRecommendedProductCard } from "@/features/home/components/HomeRecommendedProductCard";

export const metadata: Metadata = {
  title: "REVA | Ropa de segunda mano y moda circular",
  description: "Descubre prendas de segunda mano seleccionadas con intención y explora moda circular con REVA.",
  alternates: { canonical: "/" },
};

/** Orients visitors through a compact editorial Home with real, curated published inventory. */
export default async function Home() {
  const recommended = (await (await createPublicProductService()).listRecommended())
    .map(toCatalogProductPreview)
    .filter((product): product is NonNullable<typeof product> => product !== null)
    .slice(0, 4);
  const heroProduct = recommended[0];
  const heroImage = heroProduct?.image;

  return <main id="main-content">
    <section className="overflow-hidden bg-[#dceef6] py-12 sm:py-16 lg:py-20"><PageContainer><div className={`grid gap-10 ${heroImage ? "lg:grid-cols-[0.9fr_1.1fr] lg:items-end" : "max-w-3xl"}`}><div className="max-w-xl space-y-7 lg:pb-8"><Text className="text-[#1461a4]" variant="label">Moda circular en Guatemala</Text><Heading className="text-[#10233d] sm:text-6xl" level={1} variant="editorial">Prendas con historia. Estilo con futuro.</Heading><Text className="max-w-md text-lg text-[#39556d]" variant="body">Descubre piezas seleccionadas para seguir circulando con intención.</Text><Button href="/catalogo" variant="solid">Explorar prendas</Button></div>{heroImage ? <div className="relative mx-auto w-full max-w-md lg:max-w-none"><div className="absolute -left-8 top-10 size-40 rounded-full bg-[#ede0cc] sm:size-52" />{"width" in heroImage ? <Image alt={heroImage.alt} className="relative aspect-[4/5] w-full object-cover shadow-[18px_20px_0_#c7ddeb]" height={heroImage.height} priority src={heroImage.src} width={heroImage.width} /> : <Image alt={heroImage.alt} className="relative aspect-[4/5] w-full object-cover shadow-[18px_20px_0_#c7ddeb]" priority src={heroImage.src} />}</div> : null}</div></PageContainer></section>
    {recommended.length ? <Section><div className="space-y-5"><div className="flex items-end justify-between gap-4"><div><Text className="text-[#1461a4]" variant="label">Recomendado por REVA</Text><Heading className="mt-2 text-[#10233d]" level={2} variant="editorial">Descubre primero.</Heading></div><Button href="/catalogo" variant="outline">Ver catálogo</Button></div><div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">{recommended.map((product) => <HomeRecommendedProductCard key={product.href} product={product} />)}</div></div></Section> : null}
    <Section><div className="grid gap-6 border-y border-[#c7ddeb] py-9 sm:grid-cols-[0.9fr_1.1fr] sm:items-end"><div className="space-y-3"><Text className="text-[#1461a4]" variant="label">¿Tienes prendas que ya no usas?</Text><Heading className="max-w-lg text-[#10233d]" level={2} variant="editorial">Elige cómo quieres que sigan circulando.</Heading></div><div className="grid gap-3 sm:grid-cols-2 sm:justify-self-end"><Button href="/vender" variant="outline">Quiero vender</Button><Button href="/donar" variant="outline">Quiero donar</Button></div></div></Section>
    <section className="bg-[#ede0cc] py-12 sm:py-16"><PageContainer><div className="max-w-2xl space-y-3"><Text className="text-[#1461a4]" variant="label">REVA</Text><Heading className="text-[#10233d]" level={2} variant="editorial">Moda circular clara, cuidada y cercana.</Heading><Text className="text-[#39556d]" variant="body">Una forma más simple de descubrir prendas con valor y darles una nueva oportunidad.</Text></div></PageContainer></section>
  </main>;
}
