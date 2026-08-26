import type { ProductImageDelivery, PublishedProductImage } from "@/features/catalog/server/product.types";

/** Resolves approved public image identity into stable delivery data. */
export interface PublicImageService {
  resolvePublishedProductImage(image: PublishedProductImage): ProductImageDelivery;
}
