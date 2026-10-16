"use server";

import { createPublicProductService } from "@/features/catalog/server/public-product.service";
import { conditionLabels } from "@/features/catalog/condition";
import { MAX_CART_ITEMS, isCartProductSlug, normalizeCartItems } from "@/features/cart/cart-storage";
import { resolveCartProductPreviews } from "@/features/cart/cart-projection";
import type { CartProductResult } from "@/features/cart/cart.types";
import { getPublicProductUrl } from "@/infrastructure/config/site";
import { getWhatsAppCartSelectionUrl } from "@/infrastructure/config/site-contact";

function validRequest(slugs: unknown): slugs is ReadonlyArray<string> {
  return Array.isArray(slugs) && slugs.length <= MAX_CART_ITEMS && slugs.every(isCartProductSlug);
}

/** Returns only current allowlisted public Product previews for anonymous Cart presentation. */
export async function getPublicCartProducts(slugs: unknown): Promise<CartProductResult> {
  if (!validRequest(slugs)) return { items: [], ok: false };
  const requested = normalizeCartItems(slugs);
  if (requested.length === 0) return { items: [], ok: true };

  try {
    const service = await createPublicProductService();
    const products = await service.getPublishedPreviewsBySlugs(requested);
    return {
      items: resolveCartProductPreviews(requested, products, conditionLabels),
      ok: true,
    };
  } catch {
    return { items: [], ok: false };
  }
}

/** Revalidates the current selection and creates a message from public facts only. */
export async function createCartWhatsAppUrl(slugs: unknown): Promise<Readonly<{ unavailable: boolean; url: string | null }>> {
  if (!validRequest(slugs)) return { unavailable: true, url: null };
  const requested = normalizeCartItems(slugs);
  if (requested.length === 0) return { unavailable: true, url: null };

  try {
    const service = await createPublicProductService();
    const products = await service.getPublishedPreviewsBySlugs(requested);
    if (products.length !== requested.length || products.some((product) => !product.image)) {
      return { unavailable: true, url: null };
    }

    return {
      unavailable: false,
      url: getWhatsAppCartSelectionUrl(products.map((product) => ({
        canonicalUrl: getPublicProductUrl(product.slug),
        price: product.price.amount,
        title: product.title,
      }))),
    };
  } catch {
    return { unavailable: true, url: null };
  }
}
