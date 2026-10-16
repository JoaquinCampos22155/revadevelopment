import { isCartProductSlug, MAX_CART_ITEMS, normalizeCartItems } from "../cart/cart-storage.ts";

export type CheckoutEntry = "cart" | "product" | "empty" | "invalid";
export type CheckoutSelection = Readonly<{ entry: CheckoutEntry; slugs: readonly string[] }>;
export type CheckoutPriceSnapshot = Readonly<{ price: string; slug: string }>;

type CheckoutSearchParams = Readonly<{
  product?: string | readonly string[];
  products?: string | readonly string[];
}>;

function isSingleString(value: string | readonly string[] | undefined): value is string {
  return typeof value === "string";
}

/** Parses only public Product slugs from the URL; no customer fields belong here. */
export function parseCheckoutSelection(params: CheckoutSearchParams): CheckoutSelection {
  if (params.product !== undefined && params.products !== undefined) return { entry: "invalid", slugs: [] };

  if (params.product !== undefined) {
    if (!isSingleString(params.product) || !isCartProductSlug(params.product)) return { entry: "invalid", slugs: [] };
    return { entry: "product", slugs: [params.product] };
  }

  if (params.products === undefined) return { entry: "empty", slugs: [] };

  const rawSlugs = typeof params.products === "string" ? [params.products] : params.products;
  if (rawSlugs.length === 0 || rawSlugs.length > MAX_CART_ITEMS || rawSlugs.some((slug) => !isCartProductSlug(slug))) {
    return { entry: "invalid", slugs: [] };
  }

  const slugs = normalizeCartItems(rawSlugs);
  return slugs.length > 0 ? { entry: "cart", slugs } : { entry: "invalid", slugs: [] };
}

/** Builds a safe Checkout URL from slugs without ever accepting customer data. */
export function createCheckoutHref(slugs: readonly string[]): string | null {
  if (slugs.length === 0 || slugs.length > MAX_CART_ITEMS || slugs.some((slug) => !isCartProductSlug(slug))) return null;
  const normalized = normalizeCartItems(slugs);
  if (normalized.length !== slugs.length) return null;
  const params = new URLSearchParams();
  for (const slug of normalized) params.append("products", slug);
  return `/checkout?${params.toString()}`;
}

/** Detects changed or reordered public prices before the WhatsApp inquiry is prepared. */
export function hasCheckoutPriceChanged(current: readonly CheckoutPriceSnapshot[], expected: readonly CheckoutPriceSnapshot[]): boolean {
  return current.length !== expected.length || current.some(({ slug, price }, index) => {
    const previous = expected[index];
    return !previous || previous.slug !== slug || previous.price !== price;
  });
}
