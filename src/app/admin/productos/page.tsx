import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { getProductPublicationStatusPresentation } from "@/features/product-manager/product-publication-status";
import {
  getNextProductManagerSort,
  normalizeProductManagerSearch,
  parseProductManagerSort,
  type ProductManagerSortColumn,
} from "@/features/product-manager/product-manager-listing";
import { createProductManagerReadService } from "@/features/product-manager/server/product-draft.composition";
import { isLocalTransactionalRequestsEnabled } from "@/features/transactions/server/local-purchase-requests";
import { ProductAdminAtmosphere } from "@/features/product-manager/components/ProductAdminAtmosphere";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gestión de Productos | Administración REVA",
  robots: { follow: false, index: false },
};

function formatPublishedAt(date: Date | null): string {
  if (!date) return "Sin publicar";
  const elapsedDays = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
  if (elapsedDays === 0) return "Hoy";
  if (elapsedDays === 1) return "1 día";
  if (elapsedDays < 7) return `${elapsedDays} días`;
  if (elapsedDays < 30) return `${Math.floor(elapsedDays / 7)} semanas`;
  return `${Math.floor(elapsedDays / 30)} meses`;
}

function parsePage(value: string | string[] | undefined): number {
  const candidate = Array.isArray(value) ? value[0] : value;
  const page = Number(candidate);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function listHref(page: number, search: string, sort: string | null): string {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (sort) params.set("orden", sort);
  if (page > 1) params.set("pagina", String(page));
  const query = params.toString();
  return query ? `/admin/productos?${query}` : "/admin/productos";
}

function sortLabel(column: ProductManagerSortColumn, sort: string | null): string {
  if (column === "product") return sort === "product-asc" ? "Producto A–Z ↑" : sort === "product-desc" ? "Producto Z–A ↓" : "Producto ↕";
  if (column === "published") return sort === "published-newest" ? "Tiempo publicado · reciente ↓" : sort === "published-oldest" ? "Tiempo publicado · antiguo ↑" : "Tiempo publicado ↕";
  return sort === "status-priority" ? "Vendidos primero ↓" : sort === "status-reverse" ? "Sin publicar primero ↑" : "Estado ↕";
}

function getSortAriaLabel(column: ProductManagerSortColumn, sort: string | null): string {
  const current = parseProductManagerSort(sort);
  const next = getNextProductManagerSort(current, column);
  const labels: Readonly<Record<string, string>> = {
    "product-asc": "Producto A a Z",
    "product-desc": "Producto Z a A",
    "published-newest": "publicación más reciente primero",
    "published-oldest": "publicación más antigua primero",
    "status-priority": "Vendido, Publicado y No publicado",
    "status-reverse": "No publicado, Publicado y Vendido",
  };
  const columnLabel = column === "product" ? "Producto" : column === "status" ? "Estado" : "Tiempo publicado";
  const currentLabel = current && current.startsWith(column === "product" ? "product-" : column === "status" ? "status-" : "published-")
    ? labels[current]
    : "orden predeterminado";
  return `${columnLabel}: orden actual ${currentLabel}; activar para ${next ? labels[next] : "volver al orden predeterminado"}`;
}

type SearchParams = Readonly<{
  pagina?: string | string[];
  q?: string | string[];
  orden?: string | string[];
}>;

type ProductManagerPageProps = Readonly<{ searchParams: Promise<SearchParams> }>;

/** Renders a compact operational selector without duplicating Catalog data or media. */
export default async function ProductManagerPage({ searchParams }: ProductManagerPageProps) {
  const params = await searchParams;
  const page = parsePage(params.pagina);
  const search = normalizeProductManagerSearch(first(params.q));
  const sort = parseProductManagerSort(first(params.orden));
  const products = await (await createProductManagerReadService()).list(page, search, sort);

  return (
    <main id="main-content">
      <ProductAdminAtmosphere>
        <Section>
          <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="space-y-3">
                <Text variant="label">Administración interna</Text>
                <Heading level={1} variant="editorial">Gestión de Productos</Heading>
                <Text className="max-w-2xl" variant="body">Registra, revisa y administra las prendas de REVA.</Text>
              </div>
              <div className="flex flex-wrap gap-3">{isLocalTransactionalRequestsEnabled() ? <Button href="/admin/solicitudes" variant="outline">Gestión · Solicitudes y órdenes</Button> : null}<Button href="/admin/productos/recomendados" variant="outline">Ordenar recomendados</Button><Button href="/admin/productos/nuevo" variant="solid">Agregar producto</Button></div>
            </div>

            <section aria-labelledby="products-heading" className="space-y-4">
              <div className="flex items-baseline justify-between gap-4">
                <div id="products-heading"><Heading className="text-2xl sm:text-3xl" level={2} variant="clean">Productos</Heading></div>
                <Text variant="quiet">Página {page}</Text>
              </div>

              <form action="/admin/productos" className="grid gap-3 rounded-xl border border-slate-200 bg-white/90 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.55fr)_auto] sm:items-end xl:grid-cols-[minmax(0,1fr)_auto]">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-800" htmlFor="product-search">Buscar por SKU o producto</label>
                  <input autoComplete="off" className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-950 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" defaultValue={search} id="product-search" maxLength={80} name="q" placeholder="Buscar por SKU o producto..." type="search" />
                </div>
                <div className="space-y-1.5 xl:hidden">
                  <label className="text-sm font-medium text-slate-800" htmlFor="product-sort">Ordenar productos</label>
                  <select className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" defaultValue={sort ?? ""} id="product-sort" name="orden">
                    <option value="">Más recientes primero</option>
                    <option value="product-asc">Producto: A a Z</option>
                    <option value="product-desc">Producto: Z a A</option>
                    <option value="published-newest">Tiempo publicado: reciente</option>
                    <option value="published-oldest">Tiempo publicado: antiguo</option>
                    <option value="status-priority">Estado: vendidos primero</option>
                    <option value="status-reverse">Estado: sin publicar primero</option>
                  </select>
                </div>
                <Button className="sm:min-w-28" type="submit" variant="outline">Aplicar</Button>
              </form>

              {products.items.length ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/95">
                  <div className="hidden grid-cols-[5.5rem_4.5rem_minmax(12rem,1.8fr)_minmax(8.5rem,1fr)_minmax(5.5rem,0.8fr)_minmax(8rem,0.9fr)_7rem] items-center gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-3 text-xs font-medium uppercase tracking-[0.08em] text-slate-600 xl:grid">
                    <span>SKU</span><span>Imagen</span>
                    <SortLink column="product" label={sortLabel("product", sort)} search={search} sort={sort} />
                    <SortLink column="status" label={sortLabel("status", sort)} search={search} sort={sort} />
                    <span>Precio</span>
                    <SortLink column="published" label={sortLabel("published", sort)} search={search} sort={sort} />
                    <span>Gestionar</span>
                  </div>
                  <ul className="divide-y divide-slate-200">
                    {products.items.map((product) => {
                      const publication = getProductPublicationStatusPresentation(product.status, product.isPubliclyVisible);
                      return (
                        <li className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2 px-4 py-4 xl:grid-cols-[5.5rem_4.5rem_minmax(12rem,1.8fr)_minmax(8.5rem,1fr)_minmax(5.5rem,0.8fr)_minmax(8rem,0.9fr)_7rem] xl:gap-3" key={product.id}>
                          <p className="col-span-2 text-xs text-slate-600 xl:col-span-1 xl:text-sm">SKU: {product.sku}</p>
                          <div className="row-span-4 flex h-20 w-[4.5rem] items-center justify-center overflow-hidden rounded-md bg-slate-100 xl:row-span-1 xl:h-16 xl:w-16">
                            {product.primaryImage ? <ProductThumbnail alt={product.primaryImage.altText} height={product.primaryImage.height} isPublic={product.primaryImage.isPublic} src={product.primaryImage.url} width={product.primaryImage.width} /> : <span aria-hidden="true" className="text-xs text-slate-500">Sin foto</span>}
                          </div>
                          <p className="min-w-0 break-words font-medium text-slate-950 xl:text-sm">{product.title}</p>
                          <div className="text-sm">
                            <p className={publication.tone === "non-public" ? "font-medium text-rose-800" : "font-medium text-emerald-800"}>
                              {publication.tone === "sold" ? <span aria-hidden="true" className="mr-1 inline-flex h-4 w-4 translate-y-0.5 align-text-bottom"><svg fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.7" /><path d="m6 10 2.5 2.5L14 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></svg></span> : <span aria-hidden="true">● </span>}{publication.label}
                            </p>
                            {publication.domainLabel ? <p className="mt-1 text-slate-600">{publication.domainLabel}</p> : null}
                          </div>
                          <p className="text-sm text-slate-700"><span className="text-xs text-slate-500 xl:hidden">Precio: </span>{product.price ? `Q${product.price.amount}` : "Sin precio"}</p>
                          <p className="text-sm text-slate-600"><span className="text-xs text-slate-500 xl:hidden">Tiempo publicado: </span>{formatPublishedAt(product.publishedAt)}</p>
                          <Button className="col-start-2 xl:col-start-auto" href={`/admin/productos/${product.id}`} variant="outline">Gestionar</Button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="border-y border-dashed border-slate-300 px-6 py-12 text-center">
                  <Heading level={2} variant="clean">{search ? "No encontramos productos con esa búsqueda." : "Aún no hay productos."}</Heading>
                  <Text className="mx-auto mt-3 max-w-md" variant="quiet">{search ? "Prueba otro SKU o nombre de producto." : "Registra una prenda para comenzar a gestionarla."}</Text>
                  {!search ? <div className="mt-6"><Button href="/admin/productos/nuevo" variant="solid">Agregar producto</Button></div> : null}
                </div>
              )}

              {page > 1 || products.hasNextPage ? (
                <nav aria-label="Paginación de productos" className="flex justify-between gap-4">
                  {page > 1 ? <Button href={listHref(page - 1, search, sort)} variant="outline">Anterior</Button> : <span />}
                  {products.hasNextPage ? <Button href={listHref(page + 1, search, sort)} variant="outline">Siguiente</Button> : null}
                </nav>
              ) : null}
            </section>
          </div>
        </Section>
      </ProductAdminAtmosphere>
    </main>
  );
}

function ProductThumbnail({ alt, height, isPublic, src, width }: Readonly<{ alt: string; height: number; isPublic: boolean; src: string; width: number }>) {
  return <Image alt={alt} className="h-full w-full object-cover" decoding="async" height={height} loading="lazy" sizes="(min-width: 1280px) 64px, 72px" src={src} unoptimized={!isPublic} width={width} />;
}

function SortLink({ column, label, search, sort }: Readonly<{
  column: ProductManagerSortColumn;
  label: string;
  search: string;
  sort: string | null;
}>) {
  const nextSortValue = getNextProductManagerSort(parseProductManagerSort(sort), column);
  return <Link aria-label={getSortAriaLabel(column, sort)} className="rounded-sm hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href={listHref(1, search, nextSortValue)}>{label}</Link>;
}
