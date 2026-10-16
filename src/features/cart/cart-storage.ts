export const CART_STORAGE_KEY = "reva-cart";
export const CART_STORAGE_VERSION = 1;
export const MAX_CART_ITEMS = 20;

const productSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isCartProductSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= 180 && productSlugPattern.test(value);
}

export function normalizeCartItems(values: ReadonlyArray<unknown>): string[] {
  const unique: string[] = [];
  for (const value of values) {
    if (isCartProductSlug(value) && !unique.includes(value)) unique.push(value);
    if (unique.length === MAX_CART_ITEMS) break;
  }
  return unique;
}

/** Reads the small, versioned public-slug-only browser record without trusting its contents. */
export function parseCartStorage(rawValue: string | null): string[] {
  if (!rawValue || rawValue.length > 8192) return [];

  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return [];
    const record = parsed as { version?: unknown; items?: unknown };
    if (record.version !== CART_STORAGE_VERSION || !Array.isArray(record.items)) return [];
    return normalizeCartItems(record.items);
  } catch {
    return [];
  }
}

export function serializeCartStorage(items: ReadonlyArray<string>): string {
  return JSON.stringify({ version: CART_STORAGE_VERSION, items: normalizeCartItems(items) });
}

export function addCartItem(items: ReadonlyArray<string>, slug: string): string[] {
  if (!isCartProductSlug(slug) || items.includes(slug) || items.length >= MAX_CART_ITEMS) return [...items];
  return [...items, slug];
}

export function removeCartItem(items: ReadonlyArray<string>, slug: string): string[] {
  return items.filter((item) => item !== slug);
}
