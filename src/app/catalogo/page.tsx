import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { parseCatalogSearchParams, type CatalogSearchParams } from "@/features/catalog/catalog-filter-params";
import { CatalogFilters } from "@/features/catalog/components/CatalogFilters";
import { CatalogProductCard } from "@/features/catalog/components/CatalogProductCard";
import { toCatalogProductPreview } from "@/features/catalog/public-product.presentation";
import { createPublicProductService } from "@/features/catalog/server/public-product.service";

type CatalogPageProps = Readonly<{ searchParams: Promise<CatalogSearchParams> }>;

function hasSearchParams(params: CatalogSearchParams): boolean { return Object.values(params).some((value) => typeof value === "string" ? value.length > 0 : value?.length); }

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> { const hasFilters = hasSearchParams(await searchParams); return { title: "Catálogo | REVA", description: "Explora prendas de moda circular en Guatemala con REVA.", alternates: { canonical: "/catalogo" }, robots: hasFilters ? { follow: true, index: false } : undefined }; }

/** Keeps Catalog focused on browsing and filtering real published inventory. */
export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const service = await createPublicProductService(); const facets = await service.listPublishedFacets(); const parsed = parseCatalogSearchParams(await searchParams, facets); const result = await service.listPublished(parsed.query); const products = result.items.map(toCatalogProductPreview).filter((product): product is NonNullable<typeof product> => product !== null);
  return <main id="main-content"><section className="bg-[#f4f7f8] py-10 sm:py-14"><PageContainer><div className="space-y-3"><Text variant="label">Catálogo REVA</Text><Heading className="max-w-3xl sm:text-5xl" level={1} variant="editorial">Explora piezas con carácter.</Heading></div></PageContainer></section><Section><div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start"><CatalogFilters facets={facets} filters={parsed.query.filters} hasActiveFilters={parsed.hasActiveFilters} /><div className="min-w-0 space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><Heading level={2} variant="editorial">Prendas disponibles</Heading><p aria-live="polite" className="text-sm text-slate-500">{result.total} piezas seleccionadas</p></div><div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">{products.map((product) => <CatalogProductCard key={product.href} product={product} />)}{products.length === 0 ? <div className="space-y-3 sm:col-span-2 xl:col-span-3"><p className="text-sm text-slate-600">{parsed.hasActiveFilters ? "No encontramos piezas con esta combinación de filtros." : "Próximamente encontrarás piezas seleccionadas por REVA."}</p>{parsed.hasActiveFilters ? <a className="text-sm font-medium text-cyan-800 underline underline-offset-4" href="/catalogo">Limpiar filtros</a> : null}</div> : null}</div></div></div></Section></main>;
}
