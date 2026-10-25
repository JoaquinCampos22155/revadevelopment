import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { parseCatalogSearchParams, type CatalogSearchParams } from "@/features/catalog/catalog-filter-params";
import { buildCatalogPageHref, resolveCatalogPagination } from "@/features/catalog/catalog-pagination";
import { getCatalogMetadataPolicy } from "@/features/catalog/catalog-seo";
import { CatalogPagination } from "@/features/catalog/components/CatalogPagination";
import { CatalogPageNavigationFocus } from "@/features/catalog/components/CatalogPageNavigationFocus";
import { CatalogFilters } from "@/features/catalog/components/CatalogFilters";
import { CatalogProductCard } from "@/features/catalog/components/CatalogProductCard";
import { toCatalogProductPreview } from "@/features/catalog/public-product.presentation";
import { createPublicProductService } from "@/features/catalog/server/public-product.service";

type CatalogPageProps = Readonly<{ searchParams: Promise<CatalogSearchParams> }>;

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  const policy = getCatalogMetadataPolicy(await searchParams);
  return {
    title: "Catálogo de ropa de segunda mano | REVA",
    description: "Explora prendas de segunda mano y moda circular seleccionadas por REVA.",
    alternates: { canonical: policy.canonical },
    robots: policy.index ? undefined : { follow: true, index: false },
  };
}

/** Keeps Catalog focused on browsing real published inventory with server-owned filtering. */
export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const service = await createPublicProductService();
  const facets = await service.listPublishedFacets();
  const rawSearchParams = await searchParams;
  const parsed = parseCatalogSearchParams(rawSearchParams, facets);
  const result = await service.listPublished(parsed.query);
  const pagination = resolveCatalogPagination(result.page, result.total, result.pageSize);
  if (pagination.currentPage !== result.page) {
    const currentParams = new URLSearchParams();
    for (const [name, value] of Object.entries(rawSearchParams)) {
      if (Array.isArray(value)) value.forEach((entry) => currentParams.append(name, entry));
      else if (typeof value === "string") currentParams.set(name, value);
    }
    redirect(buildCatalogPageHref(currentParams, pagination.currentPage));
  }
  const products = result.items.map(toCatalogProductPreview).filter((product): product is NonNullable<typeof product> => product !== null);

  const currentSearchParams = new URLSearchParams();
  for (const [name, value] of Object.entries(rawSearchParams)) {
    if (Array.isArray(value)) value.forEach((entry) => currentSearchParams.append(name, entry));
    else if (typeof value === "string") currentSearchParams.set(name, value);
  }

  return <main className="reva-route-transition" id="main-content"><CatalogPageNavigationFocus /><section className="bg-reva-muted py-10 sm:py-14"><PageContainer><div className="reva-motion-enter space-y-3"><Text className="text-reva-brand-strong" variant="label">Catálogo REVA</Text><Heading className="max-w-3xl text-reva-primary sm:text-5xl" level={1} variant="editorial">Prendas de segunda mano con carácter.</Heading><Link className="inline-flex min-h-11 items-center text-sm font-medium text-reva-brand-strong underline decoration-reva-border underline-offset-4 hover:decoration-reva-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2" href="/como-funciona#comprar">¿Cómo funciona comprar en REVA?</Link></div></PageContainer></section><Section><div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start"><CatalogFilters facets={facets} filters={parsed.query.filters} hasActiveFilters={parsed.hasActiveFilters} /><div className="min-w-0 space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><Heading className="text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-4" id="catalog-results" level={2} tabIndex={-1} variant="editorial">Disponibles ahora</Heading><p aria-live="polite" className="text-sm text-reva-secondary">{result.total} piezas seleccionadas</p></div><div className="reva-catalog-page-enter grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3" key={currentSearchParams.toString()}>{products.map((product) => <CatalogProductCard key={product.href} product={product} />)}{products.length === 0 ? <div className="space-y-3 sm:col-span-2 xl:col-span-3"><p className="text-sm text-reva-secondary">{parsed.hasActiveFilters ? "No encontramos piezas con esta combinación de filtros." : "Próximamente encontrarás piezas seleccionadas por REVA."}</p>{parsed.hasActiveFilters ? <a className="text-sm font-medium text-reva-action underline underline-offset-4" href="/catalogo">Limpiar filtros</a> : null}</div> : null}</div><CatalogPagination page={pagination.currentPage} pageSize={result.pageSize} searchParams={currentSearchParams} total={result.total} /></div></div></Section></main>;
}
