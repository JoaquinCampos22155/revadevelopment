"use server";

import { readCheckoutProducts } from "@/features/checkout/server/checkout-products";
import type { CheckoutProduct, CheckoutResolvedItem } from "@/features/checkout/checkout.types";
import { hasCheckoutPriceChanged } from "@/features/checkout/checkout-selection";
import { getPublicProductUrl } from "@/infrastructure/config/site";
import { getWhatsAppCheckoutSelectionUrl, isWhatsAppConfigured } from "@/infrastructure/config/site-contact";
import { isCartProductSlug, MAX_CART_ITEMS, normalizeCartItems } from "@/features/cart/cart-storage";

type CheckoutActionResult = Readonly<{
  items: readonly CheckoutResolvedItem[];
  status: "invalid" | "unavailable" | "changed" | "contact-unavailable" | "ready";
  url?: string;
}>;

function validSlugs(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.length > 0 && value.length <= MAX_CART_ITEMS && value.every(isCartProductSlug);
}

function validSnapshot(value: unknown): value is readonly Readonly<{ price: string; slug: string }> [] {
  return Array.isArray(value) && value.length > 0 && value.length <= MAX_CART_ITEMS && value.every((item) =>
    typeof item === "object" && item !== null && "slug" in item && isCartProductSlug(item.slug)
      && "price" in item && typeof item.price === "string" && /^\d+\.\d{2}$/.test(item.price));
}

/** Rechecks inventory and price immediately before creating the public-only inquiry URL. */
export async function createCheckoutWhatsAppUrl(slugs: unknown, expected: unknown): Promise<CheckoutActionResult> {
  if (!validSlugs(slugs) || !validSnapshot(expected)) return { items: [], status: "invalid" };
  const requested = normalizeCartItems(slugs);
  if (requested.length !== slugs.length || expected.length !== requested.length) return { items: [], status: "invalid" };

  const result = await readCheckoutProducts(requested);
  if (!result.ok) return { items: [], status: "unavailable" };
  if (result.items.some(({ product }) => !product)) return { items: result.items, status: "unavailable" };

  const products = result.items.flatMap(({ product }) => product ? [product] : []);
  if (hasCheckoutPriceChanged(products.map(({ slug, price }) => ({ slug, price })), expected)) {
    return { items: result.items, status: "changed" };
  }
  if (!isWhatsAppConfigured()) return { items: result.items, status: "contact-unavailable" };

  try {
    const url = getWhatsAppCheckoutSelectionUrl(products.map((product: CheckoutProduct) => ({
      canonicalUrl: getPublicProductUrl(product.slug),
      price: product.price,
      title: product.title,
    })));
    return url ? { items: result.items, status: "ready", url } : { items: result.items, status: "contact-unavailable" };
  } catch {
    return { items: result.items, status: "contact-unavailable" };
  }
}
