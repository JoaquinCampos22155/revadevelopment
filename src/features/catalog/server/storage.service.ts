import type { ProductId, ProductImage, ProductImageKind } from "@/features/catalog/server/product.types";
import type { StorageUploadIntent } from "@/infrastructure/contracts/storage-provider";

/** Coordinates product-image ownership with future storage operations without persisting public URLs. */
export interface StorageService {
  createProductImageUploadIntent(input: Readonly<{
    kind: ProductImageKind;
    productId: ProductId;
  }>): Promise<StorageUploadIntent>;
  finalizeProductImage(input: Readonly<{
    altText: string;
    kind: ProductImageKind;
    productId: ProductId;
    storageKey: string;
  }>): Promise<ProductImage>;
}
