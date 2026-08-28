import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { getProductPublicationStatusPresentation } from "@/features/product-manager/product-publication-status";
import { createProductManagerReadService } from "@/features/product-manager/server/product-draft.composition";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gestión de Productos | Administración REVA",
  robots: { follow: false, index: false },
};

function formatPublishedAt(date: Date | null, isPubliclyVisible: boolean): string {
  if (!date || !isPubliclyVisible) return "Sin publicar";
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

type ProductManagerPageProps = Readonly<{ searchParams: Promise<{ pagina?: string | string[] }> }>;

/** Renders a compact operational selector without duplicating Catalog data or media. */
export default async function ProductManagerPage({ searchParams }: ProductManagerPageProps) {
  const page = parsePage((await searchParams).pagina);
  const products = await (await createProductManagerReadService()).list(page);

  return (
    <main id="main-content">
      <Section>
        <div className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="space-y-3">
              <Text variant="label">Administración interna</Text>
              <Heading level={1} variant="editorial">Gestión de Productos</Heading>
              <Text className="max-w-2xl" variant="body">Registra, revisa y administra las prendas de REVA.</Text>
            </div>
            <div className="flex flex-wrap gap-3"><Button href="/admin/productos/recomendados" variant="outline">Ordenar recomendados</Button><Button href="/admin/productos/nuevo" variant="solid">Agregar producto</Button></div>
          </div>

          <section aria-labelledby="products-heading" className="space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <div id="products-heading"><Heading className="text-2xl sm:text-3xl" level={2} variant="clean">Productos</Heading></div>
              <Text variant="quiet">Página {page}</Text>
            </div>

            {products.items.length ? (
              <div className="overflow-hidden border-y border-slate-200 bg-white">
                <div className="hidden grid-cols-[0.8fr_1.8fr_1fr_0.8fr_0.9fr_auto] gap-4 border-b border-slate-200 px-3 py-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-600 lg:grid">
                  <span>SKU</span><span>Producto</span><span>Estado</span><span>Precio</span><span>Tiempo publicado</span><span />
                </div>
                <ul className="divide-y divide-slate-200">
                  {products.items.map((product) => {
                    const publication = getProductPublicationStatusPresentation(product.status, product.isPubliclyVisible);
                    return (
                      <li className="grid gap-3 px-3 py-4 lg:grid-cols-[0.8fr_1.8fr_1fr_0.8fr_0.9fr_auto] lg:items-center lg:gap-4" key={product.id}>
                        <p className="text-sm text-slate-700"><span className="lg:hidden">SKU: </span>{product.sku}</p>
                        <p className="font-medium text-slate-950">{product.title}</p>
                        <div className="text-sm">
                          <p className={publication.tone === "public" ? "font-medium text-emerald-800" : "font-medium text-rose-800"}><span aria-hidden="true">● </span>{publication.label}</p>
                          {publication.domainLabel ? <p className="mt-1 text-slate-600">{publication.domainLabel}</p> : null}
                        </div>
                        <p className="text-sm text-slate-700">{product.price ? `Q${product.price.amount}` : "Sin precio"}</p>
                        <p className="text-sm text-slate-600">{formatPublishedAt(product.publishedAt, product.isPubliclyVisible)}</p>
                        <Button href={`/admin/productos/${product.id}`} variant="outline">Gestionar</Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="border-y border-dashed border-slate-300 px-6 py-12 text-center">
                <Heading level={2} variant="clean">Aún no hay productos.</Heading>
                <Text className="mx-auto mt-3 max-w-md" variant="quiet">Registra una prenda para comenzar a gestionarla.</Text>
                <div className="mt-6"><Button href="/admin/productos/nuevo" variant="solid">Agregar producto</Button></div>
              </div>
            )}

            {page > 1 || products.hasNextPage ? (
              <nav aria-label="Paginación de productos" className="flex justify-between gap-4">
                {page > 1 ? <Button href={`/admin/productos?pagina=${page - 1}`} variant="outline">Anterior</Button> : <span />}
                {products.hasNextPage ? <Button href={`/admin/productos?pagina=${page + 1}`} variant="outline">Siguiente</Button> : null}
              </nav>
            ) : null}
          </section>
        </div>
      </Section>
    </main>
  );
}
