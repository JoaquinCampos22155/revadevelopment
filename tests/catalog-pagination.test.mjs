import assert from "node:assert/strict";
import test from "node:test";

const paginationModule = await import("../src/features/catalog/catalog-pagination.ts").catch(() => ({}));

function catalogPagination() {
  assert.equal(typeof paginationModule.buildCatalogPageHref, "function", "catalog pagination URL builder is implemented");
  assert.equal(typeof paginationModule.buildCatalogFilterHref, "function", "catalog filter URL builder is implemented");
  assert.equal(typeof paginationModule.resolveCatalogPagination, "function", "catalog page-range resolver is implemented");
  assert.equal(typeof paginationModule.getCatalogPageNumberItems, "function", "numbered pagination window is implemented");
  assert.equal(typeof paginationModule.getCatalogPageRange, "function", "database page ranges are bounded");
  return paginationModule;
}

test("pagination preserves filters and sorting while setting the requested page", () => {
  const { buildCatalogPageHref } = catalogPagination();
  const params = new URLSearchParams("audiencia=mujer&audiencia=hombre&orden=precio_asc&pagina=2");

  assert.equal(buildCatalogPageHref(params, 3), "/catalogo?audiencia=mujer&audiencia=hombre&orden=precio_asc&pagina=3#catalog-results");
  assert.equal(buildCatalogPageHref(params, 1), "/catalogo?audiencia=mujer&audiencia=hombre&orden=precio_asc#catalog-results");
});

test("changing filters resets the page and keeps unrelated sorting state", () => {
  const { buildCatalogFilterHref } = catalogPagination();
  const current = new URLSearchParams("audiencia=hombre&pagina=4&orden=precio_asc");
  const nextFilters = new URLSearchParams("audiencia=mujer&color=azul");

  assert.equal(buildCatalogFilterHref(current, nextFilters), "/catalogo?orden=precio_asc&audiencia=mujer&color=azul");
});

test("pagination clamps an out-of-range page to the final available page", () => {
  const { resolveCatalogPagination } = catalogPagination();
  assert.deepEqual(resolveCatalogPagination(8, 49, 15), {
    currentPage: 4,
    endItem: 49,
    pageCount: 4,
    startItem: 46,
  });
});

test("empty inventories still resolve safely to the first page", () => {
  const { resolveCatalogPagination } = catalogPagination();
  assert.deepEqual(resolveCatalogPagination(5, 0, 15), {
    currentPage: 1,
    endItem: 0,
    pageCount: 0,
    startItem: 0,
  });
});

test("invalid page numbers resolve to page one", () => {
  const { resolveCatalogPagination } = catalogPagination();
  assert.equal(resolveCatalogPagination(Number.NaN, 49, 15).currentPage, 1);
});

test("large catalogs expose a compact numbered window with gaps", () => {
  const { getCatalogPageNumberItems } = catalogPagination();
  assert.deepEqual(getCatalogPageNumberItems(6, 12), [1, "ellipsis", 5, 6, 7, "ellipsis", 12]);
});

test("a page contains at most fifteen Products and the database range never expands beyond it", () => {
  const { getCatalogPageRange } = catalogPagination();
  assert.deepEqual(getCatalogPageRange(1, 15), { first: 0, last: 14 });
  assert.deepEqual(getCatalogPageRange(2, 15), { first: 15, last: 29 });
  assert.deepEqual(getCatalogPageRange(67, 15), { first: 990, last: 1004 });
  assert.deepEqual(getCatalogPageRange(1, 100), { first: 0, last: 14 });
});

test("fifteen-per-page pagination neither skips nor duplicates items across catalog sizes", () => {
  const { getCatalogPageRange, resolveCatalogPagination } = catalogPagination();
  const scenarios = [
    { total: 15, pages: 1, lastPageSize: 15 },
    { total: 16, pages: 2, lastPageSize: 1 },
    { total: 25, pages: 2, lastPageSize: 10 },
    { total: 100, pages: 7, lastPageSize: 10 },
    { total: 1_000, pages: 67, lastPageSize: 10 },
  ];

  for (const scenario of scenarios) {
    const products = Array.from({ length: scenario.total }, (_, index) => `product-${String(index + 1).padStart(4, "0")}`);
    const pageCount = resolveCatalogPagination(1, scenario.total, 15).pageCount;
    const seen = [];

    assert.equal(pageCount, scenario.pages);
    for (let page = 1; page <= pageCount; page += 1) {
      const range = getCatalogPageRange(page, 15);
      const currentPage = resolveCatalogPagination(page, scenario.total, 15);
      const currentItems = products.slice(range.first, Math.min(range.last + 1, scenario.total));
      assert.ok(currentItems.length <= 15);
      assert.equal(currentItems.length, currentPage.endItem - currentPage.startItem + 1);
      if (page === pageCount) assert.equal(currentItems.length, scenario.lastPageSize);
      seen.push(...currentItems);
    }

    assert.deepEqual(seen, products);
    assert.equal(new Set(seen).size, scenario.total);
  }
});
