import type { ProcessedProductImage, ProductImageSource } from "@/features/product-manager/server/product-media.types";

/** Validates and normalizes incoming photography before any provider persistence occurs. */
export interface ProductImageProcessor {
  process(source: ProductImageSource): Promise<ProcessedProductImage>;
}
