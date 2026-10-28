export type ProductManagerSort =
  | "product-asc"
  | "product-desc"
  | "published-newest"
  | "published-oldest"
  | "status-priority"
  | "status-reverse";

export type ProductManagerSortColumn = "product" | "published" | "status";

const sortValues = new Set<ProductManagerSort>([
  "product-asc",
  "product-desc",
  "published-newest",
  "published-oldest",
  "status-priority",
  "status-reverse",
]);

const sortCycle: Readonly<Record<ProductManagerSortColumn, readonly ProductManagerSort[]>> = {
  product: ["product-asc", "product-desc"],
  published: ["published-newest", "published-oldest"],
  status: ["status-priority", "status-reverse"],
};

export function parseProductManagerSort(value: string | null | undefined): ProductManagerSort | null {
  return value && sortValues.has(value as ProductManagerSort) ? (value as ProductManagerSort) : null;
}

export function getNextProductManagerSort(
  current: ProductManagerSort | null,
  column: ProductManagerSortColumn,
): ProductManagerSort | null {
  const cycle = sortCycle[column];
  const currentIndex = current ? cycle.indexOf(current) : -1;
  return currentIndex === cycle.length - 1 ? null : cycle[currentIndex + 1];
}

/** Restricts free text to literal search terms safe for PostgREST's filter grammar. */
export function normalizeProductManagerSearch(value: string | null | undefined): string {
  if (!value) return "";

  return value
    .normalize("NFC")
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/gu, " ")
    .slice(0, 80)
    .trim();
}

/** Joins sanitized words with ILIKE wildcards so punctuation between title words is harmless. */
export function buildProductManagerSearchPattern(search: string): string {
  return `%${search.split(/\s+/u).filter(Boolean).join("%")}%`;
}
