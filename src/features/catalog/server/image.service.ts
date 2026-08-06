import type { ProductImage } from "@/features/catalog/server/product.types";

/** Resolves provider-neutral product-image keys into delivery data for presentation and SEO. */
export interface ImageService {
  resolveProductImage(image: ProductImage): Promise<Readonly<{
    altText: string;
    url: string;
  }>>;
}
