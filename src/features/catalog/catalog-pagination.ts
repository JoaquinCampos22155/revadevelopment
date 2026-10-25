const filterParameterNames = ["audiencia", "tipo", "talla", "color", "condicion", "marca", "precio_min", "precio_max"] as const;

export type CatalogPageNumberItem = number | "ellipsis";
export const CATALOG_PAGE_SIZE = 15;

function normalizePageSize(pageSize: number): number {
  return Number.isSafeInteger(pageSize) && pageSize > 0
    ? Math.min(pageSize, CATALOG_PAGE_SIZE)
    : CATALOG_PAGE_SIZE;
}

/** Builds a local Catalog URL without dropping active filters or sort state. */
export function buildCatalogPageHref(currentParams: URLSearchParams, page: number): string {
  const nextParams = new URLSearchParams(currentParams);
  const safePage = Number.isSafeInteger(page) && page > 1 ? page : 1;
  if (safePage === 1) nextParams.delete("pagina");
  else nextParams.set("pagina", String(safePage));
  const query = nextParams.toString();
  return `${query ? `/catalogo?${query}` : "/catalogo"}#catalog-results`;
}

/** Replaces Catalog filters while retaining unrelated view state and returning to page one. */
export function buildCatalogFilterHref(currentParams: URLSearchParams, selectedFilters: URLSearchParams): string {
  const nextParams = new URLSearchParams(currentParams);
  for (const name of filterParameterNames) nextParams.delete(name);
  nextParams.delete("pagina");
  for (const [name, value] of selectedFilters) nextParams.append(name, value);
  const query = nextParams.toString();
  return query ? `/catalogo?${query}` : "/catalogo";
}

export function resolveCatalogPagination(page: number, total: number, pageSize: number): Readonly<{
  currentPage: number;
  endItem: number;
  pageCount: number;
  startItem: number;
}> {
  const safeTotal = Number.isSafeInteger(total) && total > 0 ? total : 0;
  const safePageSize = normalizePageSize(pageSize);
  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const pageCount = Math.ceil(safeTotal / safePageSize);
  const currentPage = pageCount === 0 ? 1 : Math.min(safePage, pageCount);

  return {
    currentPage,
    endItem: safeTotal === 0 ? 0 : Math.min(safeTotal, currentPage * safePageSize),
    pageCount,
    startItem: safeTotal === 0 ? 0 : (currentPage - 1) * safePageSize + 1,
  };
}

/** Keeps each public repository range within the approved Catalog page bound. */
export function getCatalogPageRange(page: number, pageSize: number): Readonly<{ first: number; last: number }> {
  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const safePageSize = normalizePageSize(pageSize);
  const first = (safePage - 1) * safePageSize;
  return { first, last: first + safePageSize - 1 };
}

export function getCatalogPageNumberItems(currentPage: number, pageCount: number): ReadonlyArray<CatalogPageNumberItem> {
  if (pageCount <= 0) return [];
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(pageCount - 1, currentPage + 1);
  const items: CatalogPageNumberItem[] = [1];
  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < pageCount - 1) items.push("ellipsis");
  items.push(pageCount);
  return items;
}
