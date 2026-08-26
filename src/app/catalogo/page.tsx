import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { catalogReviews } from "@/content/catalog";
import { parseCatalogSearchParams, type CatalogSearchParams } from "@/features/catalog/catalog-filter-params";
import { CatalogFilters } from "@/features/catalog/components/CatalogFilters";
import { CatalogProductCard } from "@/features/catalog/components/CatalogProductCard";
import { ReviewCard } from "@/features/catalog/components/ReviewCard";
import { toCatalogProductPreview } from "@/features/catalog/public-product.presentation";
import { createPublicProductService } from "@/features/catalog/server/public-product.service";

type CatalogPageProps = Readonly<{ searchParams: Promise<CatalogSearchParams> }>;

function hasSearchParams(params: CatalogSearchParams): boolean {
  return Object.values(params).some((value) => typeof value === "string" ? value.length > 0 : value?.length);
}

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  const hasFilters = hasSearchParams(await searchParams);
  return {
    title: "Catálogo | REVA",
    description: "Explora colecciones de moda circular en Guatemala con REVA.",
    alternates: { canonical: "/catalogo" },
    robots: hasFilters ? { follow: true, index: false } : undefined,
  };
}

/** Combines REVA's approved editorial catalog hierarchy with trust-forward product cards. */
export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const service = await createPublicProductService();
  const facets = await service.listPublishedFacets();
  const parsed = parseCatalogSearchParams(await searchParams, facets);
  const result = await service.listPublished(parsed.query);
  const products = result.items.map(toCatalogProductPreview).filter((product): product is NonNullable<typeof product> => product !== null);
  return (
    <main id="main-content">
      <section className="bg-[#f4f7f8] py-12 sm:py-20">
        <PageContainer>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div className="space-y-5">
              <Text variant="label">Catálogo REVA</Text>
              <Heading className="max-w-3xl sm:text-6xl" level={1} variant="editorial">
                Piezas que merecen una segunda mirada.
              </Heading>
            </div>
            <Text className="max-w-md text-base" variant="body">
              Una selección de moda circular pensada para descubrir con calma, claridad y confianza.
            </Text>
          </div>
        </PageContainer>
      </section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
          <CatalogFilters facets={facets} filters={parsed.query.filters} hasActiveFilters={parsed.hasActiveFilters} />
          <div className="min-w-0 space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-3">
                <Text variant="label">Selección REVA</Text>
                <Heading level={2} variant="editorial">Descubre piezas con carácter.</Heading>
              </div>
              <p aria-live="polite" className="text-sm text-slate-500">{result.total} piezas seleccionadas</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {products.map((product) => (
                <CatalogProductCard key={product.href} product={product} />
              ))}
              {products.length === 0 ? <div className="space-y-3 sm:col-span-2 xl:col-span-3"><p className="text-sm text-slate-600">{parsed.hasActiveFilters ? "No encontramos piezas con esta combinación de filtros." : "Próximamente encontrarás piezas seleccionadas por REVA."}</p>{parsed.hasActiveFilters ? <a className="text-sm font-medium text-cyan-800 underline underline-offset-4" href="/catalogo">Limpiar filtros</a> : null}</div> : null}
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <Text variant="label">Confianza REVA</Text>
            <Heading level={2} variant="editorial">Una experiencia cuidada, de principio a fin.</Heading>
            <Text variant="quiet">
              Las reseñas aparecen después de descubrir las piezas, reduciendo incertidumbre antes del siguiente paso.
            </Text>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {catalogReviews.map((review) => <ReviewCard key={review.author} review={review} />)}
          </div>
        </div>
      </Section>

      <Section>
        <div className="rounded-3xl bg-slate-950 p-8 text-center text-white sm:p-12">
          <Text className="text-sky-200" variant="label">Una prenda puede empezar de nuevo</Text>
          <Heading className="mx-auto mt-4 max-w-2xl" level={2} variant="editorial">
            ¿Quieres saber más sobre REVA?
          </Heading>
          <div className="mt-6">
            <Button className="bg-white text-slate-950 hover:bg-sky-100" href="/contacto">
              Contactar a REVA
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
