import type { ProductId, ProductImage } from "@/features/catalog/server/product.types";
import type { StorageUploadIntent } from "@/infrastructure/contracts/storage-provider";

/**
 * Coordinates variable, ordered Product media with future storage operations
 * without treating image presentation labels as persisted media kinds.
 */
export interface StorageService {
  createProductImageUploadIntent(input: Readonly<{
    mimeType: ProductImage["mimeType"];
    productId: ProductId;
  }>): Promise<StorageUploadIntent>;
  finalizeProductImage(input: Readonly<{
    altText: string;
    height: number;
    mimeType: ProductImage["mimeType"];
    position: number;
    productId: ProductId;
    storageKey: string;
    width: number;
  }>): Promise<ProductImage>;
}
