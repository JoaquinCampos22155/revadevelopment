import type { PublishedProductPreview } from "@/features/catalog/server/product.types";
import type { CartProductView } from "@/features/cart/cart.types";

export type ResolvedCartItem = Readonly<{ product: CartProductView | null; slug: string }>;

function toCartProduct(product: PublishedProductPreview | undefined, labels: Readonly<Record<number, string>>): CartProductView | null {
  if (!product?.image) return null;

  return {
    condition: labels[product.conditionRating],
    href: `/productos/${encodeURIComponent(product.slug)}`,
    image: { alt: product.image.altText, height: product.image.height, src: product.image.url, width: product.image.width },
    price: `Q ${product.price.amount}`,
    sizeLabel: product.sizeLabel,
    slug: product.slug,
    title: product.title,
  };
}

/** Maps only current public Product previews; missing references stay visibly unavailable. */
export function resolveCartProductPreviews(
  slugs: ReadonlyArray<string>,
  products: ReadonlyArray<PublishedProductPreview>,
  labels: Readonly<Record<number, string>>,
): ReadonlyArray<ResolvedCartItem> {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  return slugs.map((slug) => ({ slug, product: toCartProduct(bySlug.get(slug), labels) }));
}
