import Link from "next/link";

import { buildCatalogPageHref, getCatalogPageNumberItems, resolveCatalogPagination } from "@/features/catalog/catalog-pagination";

type CatalogPaginationProps = Readonly<{
  page: number;
  pageSize: number;
  searchParams: URLSearchParams;
  total: number;
}>;

export function CatalogPagination({ page, pageSize, searchParams, total }: CatalogPaginationProps) {
  const pagination = resolveCatalogPagination(page, total, pageSize);
  if (pagination.pageCount <= 1) return null;

  const linkClass = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-reva-border px-3 text-sm font-medium text-reva-primary transition-colors hover:bg-reva-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus";
  const currentClass = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-reva-action px-3 text-sm font-semibold text-reva-on-action";

  return (
    <nav aria-label="Paginación del catálogo" className="flex flex-col gap-4 border-t border-reva-border pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p aria-live="polite" className="text-sm text-reva-secondary">Página {pagination.currentPage} de {pagination.pageCount}. Mostrando {pagination.startItem}–{pagination.endItem} de {total} prendas.</p>
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          {pagination.currentPage > 1
            ? <Link aria-label="Página anterior" className={`${linkClass} active:scale-[0.98]`} href={buildCatalogPageHref(searchParams, pagination.currentPage - 1)}>Anterior</Link>
            : <span aria-disabled="true" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-reva-secondary/60">Anterior</span>}
        </li>
        {getCatalogPageNumberItems(pagination.currentPage, pagination.pageCount).map((item, index) => (
          <li key={item === "ellipsis" ? `ellipsis-${index}` : item}>
            {item === "ellipsis"
              ? <span aria-hidden="true" className="px-1 text-reva-secondary">…</span>
              : item === pagination.currentPage
                ? <span aria-current="page" className={currentClass}>{item}</span>
                : <Link aria-label={`Página ${item}`} className={`${linkClass} active:scale-[0.98]`} href={buildCatalogPageHref(searchParams, item)}>{item}</Link>}
          </li>
        ))}
        <li>
          {pagination.currentPage < pagination.pageCount
            ? <Link aria-label="Página siguiente" className={`${linkClass} active:scale-[0.98]`} href={buildCatalogPageHref(searchParams, pagination.currentPage + 1)}>Siguiente</Link>
            : <span aria-disabled="true" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-reva-secondary/60">Siguiente</span>}
        </li>
      </ul>
    </nav>
  );
}
