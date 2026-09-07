import Image from "next/image";
import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import homeClothingRack from "@/assets/editorial/reva-home-clothing-rack-editorial.png";
import { toCatalogProductPreview } from "@/features/catalog/public-product.presentation";
import type { Audience } from "@/features/catalog/audiences";
import type { PublishedCatalogQuery } from "@/features/catalog/server/catalog-filter.types";
import { createPublicProductService } from "@/features/catalog/server/public-product.service";
import { HomeAudienceDiscovery } from "@/features/home/components/HomeAudienceDiscovery";
import { HomeRecommendedProductCard } from "@/features/home/components/HomeRecommendedProductCard";
import { HomeParticipationSection } from "@/features/home/components/HomeParticipationSection";

export const metadata: Metadata = {
  title: "REVA | Ropa de segunda mano y moda circular",
  description: "Descubre prendas de segunda mano seleccionadas con intención y explora moda circular con REVA.",
  alternates: { canonical: "/" },
};

function audienceQuery(audience: Audience): PublishedCatalogQuery {
  return {
    filters: {
      audiences: [audience], brands: [], colors: [], conditionRatings: [], garmentTypes: [],
      maxPriceCents: null, minPriceCents: null, sizes: [],
    },
    page: 1,
    pageSize: 1,
  };
}

/** Orients visitors through a compact editorial Home with real, curated published inventory. */
export default async function Home() {
  const service = await createPublicProductService();
  const [recommendedRows, womenResult, menResult] = await Promise.all([
    service.listRecommended(),
    service.listPublished(audienceQuery("mujer")),
    service.listPublished(audienceQuery("hombre")),
  ]);
  const recommended = recommendedRows
    .map(toCatalogProductPreview)
    .filter((product): product is NonNullable<typeof product> => product !== null)
    .slice(0, 4);
  const womanProduct = womenResult.items.map(toCatalogProductPreview).find((product): product is NonNullable<typeof product> => product !== null) ?? null;
  const manProduct = menResult.items.map(toCatalogProductPreview).find((product): product is NonNullable<typeof product> => product !== null) ?? null;

  return <main id="main-content">
    <section className="relative isolate overflow-hidden bg-reva-strong">
      <div aria-hidden className="absolute -left-24 top-16 h-72 w-72 rounded-full border border-reva-brand/45 sm:h-96 sm:w-96" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[24%] bg-reva-surface/45 sm:h-[28%] lg:inset-y-0 lg:left-[44%] lg:right-0 lg:h-auto" />
      <PageContainer>
        <div className="relative grid min-h-[35rem] items-center gap-4 py-10 sm:min-h-[39rem] sm:py-12 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[0.86fr_1.14fr] lg:gap-10 lg:py-0">
          <div className="relative z-10 max-w-xl space-y-7 lg:pb-8">
            <Text className="text-reva-brand-strong" variant="label">Moda circular en Guatemala</Text>
            <Heading className="text-reva-primary sm:text-6xl" level={1} variant="editorial">Prendas con historia. <span className="text-reva-brand">Estilo con futuro.</span></Heading>
            <Text className="max-w-md text-lg text-reva-secondary" variant="body">Descubre prendas de segunda mano seleccionadas para seguir circulando con intención.</Text>
            <Button href="/catalogo" variant="solid">Explorar prendas</Button>
          </div>
          <figure className="relative mx-auto h-64 w-full max-w-xl sm:h-80 lg:absolute lg:bottom-0 lg:right-0 lg:h-[min(42rem,82vh)] lg:w-[58%] lg:max-w-none">
            <div aria-hidden className="absolute bottom-[8%] right-[6%] h-[74%] w-[72%] rounded-t-[999px] border border-reva-brand/45 bg-reva-surface/75" />
            <div aria-hidden className="absolute bottom-[2%] right-[17%] h-[80%] w-[62%] -rotate-3 bg-reva-action" />
            <Image alt="Rack editorial con prendas de distintos estilos." className="relative h-full w-full object-contain object-bottom transition-transform duration-500 motion-reduce:transition-none lg:hover:translate-x-2" priority sizes="(min-width: 1024px) 58vw, 100vw" src={homeClothingRack} />
            <figcaption className="absolute bottom-3 left-0 max-w-[13rem] bg-reva-surface p-3 text-sm leading-5 text-reva-secondary shadow-lg sm:left-6">Una selección visual para volver a descubrir tu clóset.</figcaption>
          </figure>
        </div>
      </PageContainer>
    </section>
    {recommended.length ? <section className="relative overflow-hidden bg-reva-surface py-14 sm:py-20"><PageContainer><div className="relative"><div className="flex items-end justify-between gap-4"><div><Text className="text-reva-brand-strong" variant="label">Recomendado por REVA</Text><Heading className="mt-2 text-reva-primary" level={2} variant="editorial">Descubre primero.</Heading></div><Button href="/catalogo" variant="outline">Ver catálogo</Button></div><div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">{recommended.map((product) => <HomeRecommendedProductCard key={product.href} product={product} />)}</div></div></PageContainer></section> : null}
    <HomeAudienceDiscovery manProduct={manProduct} womanProduct={womanProduct} />
    <HomeParticipationSection />
    <section className="relative overflow-hidden bg-reva-strong py-16 sm:py-24"><div aria-hidden className="absolute -right-14 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full border-[18px] border-reva-surface/55 sm:h-80 sm:w-80" /><PageContainer><div className="relative max-w-3xl"><Text className="text-reva-brand-strong" variant="label">REVA</Text><Heading className="mt-3 text-reva-primary sm:text-5xl" level={2} variant="editorial">Moda circular clara, cuidada y cercana.</Heading><Text className="mt-4 max-w-xl text-reva-secondary" variant="body">Descubrir, vender o donar ropa puede empezar con una decisión simple.</Text></div></PageContainer></section>
  </main>;
}
