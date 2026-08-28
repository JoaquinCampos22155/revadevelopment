import { conditionLabels } from "@/features/catalog/condition";
import { garmentTypeLabel } from "@/features/catalog/public-product.presentation";
import { createPublicProductService } from "@/features/catalog/server/public-product.service";
import type { CatalogProductPreview } from "@/types/catalog";

const playgroundProductSlug = "licra-tipo-short-negro-calvin-klein";

/** Resolves one safe public Product solely for isolated visual experiments. */
export async function getPlaygroundProduct(): Promise<CatalogProductPreview | null> {
  const product = await (await createPublicProductService()).getPublishedBySlug(playgroundProductSlug);
  const primaryImage = product?.images.find((image) => image.position === 1);

  if (!product || !primaryImage) return null;

  return {
    category: garmentTypeLabel(product.garmentType),
    condition: conditionLabels[product.conditionRating],
    href: `/productos/${product.slug}`,
    image: {
      alt: primaryImage.altText,
      height: primaryImage.height,
      src: primaryImage.url,
      width: primaryImage.width,
    },
    name: product.title,
    price: `Q ${product.price.amount}`,
  };
}
