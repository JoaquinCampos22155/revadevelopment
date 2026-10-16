import "server-only";

import { conditionLabels } from "@/features/catalog/condition";
import { createPublicProductService } from "@/features/catalog/server/public-product.service";
import { isCartProductSlug, MAX_CART_ITEMS, normalizeCartItems } from "@/features/cart/cart-storage";
import type { CheckoutResolvedItem, CheckoutProduct } from "@/features/checkout/checkout.types";

export type CheckoutProductRead = Readonly<{
  items: readonly CheckoutResolvedItem[];
  ok: boolean;
}>;

/** Resolves slugs only through the normal request-scoped public Product projection. */
export async function readCheckoutProducts(untrustedSlugs: unknown): Promise<CheckoutProductRead> {
  if (!Array.isArray(untrustedSlugs) || untrustedSlugs.length === 0 || untrustedSlugs.length > MAX_CART_ITEMS || !untrustedSlugs.every(isCartProductSlug)) {
    return { items: [], ok: false };
  }

  const slugs = normalizeCartItems(untrustedSlugs);
  if (slugs.length !== untrustedSlugs.length) return { items: [], ok: false };

  try {
    const service = await createPublicProductService();
    const products = await service.getPublishedPreviewsBySlugs(slugs);
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    return {
      items: slugs.map((slug) => {
        const product = bySlug.get(slug);
        const view: CheckoutProduct | null = product?.image ? {
          condition: conditionLabels[product.conditionRating],
          image: { alt: product.image.altText, height: product.image.height, src: product.image.url, width: product.image.width },
          price: product.price.amount,
          sizeLabel: product.sizeLabel,
          slug: product.slug,
          title: product.title,
        } : null;
        return { product: view, slug };
      }),
      ok: true,
    };
  } catch {
    return { items: [], ok: false };
  }
}
