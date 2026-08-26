import type { PublicImageService } from "@/features/catalog/server/public-image.service";
import type { ProductImageDelivery, PublishedProductImage } from "@/features/catalog/server/product.types";
import type { StorageService } from "@/features/catalog/server/storage.service";

/** Resolves only deliberately public media identities; private Storage keys never cross this boundary. */
export class SupabasePublicProductImageService implements PublicImageService {
  public constructor(private readonly storage: StorageService) {}
  public resolvePublishedProductImage(image: PublishedProductImage): ProductImageDelivery {
    return { altText:image.altText, height:image.height, position:image.position, url:this.storage.createPublicProductImageUrl(image.id), width:image.width };
  }
}
