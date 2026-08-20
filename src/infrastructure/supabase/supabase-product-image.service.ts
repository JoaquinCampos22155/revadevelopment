import type { ImageService } from "@/features/catalog/server/image.service";
import type { ProductImage, ProductImageDelivery } from "@/features/catalog/server/product.types";
import type { StorageService } from "@/features/catalog/server/storage.service";
/** Converts internal keys into short-lived, delivery-safe administrator previews. */
export class SupabaseProductImageService implements ImageService {
  public constructor(private readonly storage: StorageService) {}
  public async resolveProductImage(image: ProductImage): Promise<ProductImageDelivery> { return {altText:image.altText,height:image.height,position:image.position,url:await this.storage.createProductImagePreviewUrl(image.storageKey),width:image.width}; }
}
