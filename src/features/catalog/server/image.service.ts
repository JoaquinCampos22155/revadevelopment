import type {
  ProductImage,
  ProductImageDelivery,
} from "@/features/catalog/server/product.types";

/** Resolves internal storage keys into delivery-safe image data for public presentation. */
export interface ImageService {
  resolveProductImage(image: ProductImage): Promise<ProductImageDelivery>;
}
