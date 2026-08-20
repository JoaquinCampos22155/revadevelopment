import { randomUUID } from "node:crypto";

import type { ProductId } from "@/features/catalog/server/product.types";
import type { ImageService } from "@/features/catalog/server/image.service";
import type { StorageService } from "@/features/catalog/server/storage.service";
import type { ProductImageProcessor } from "@/features/product-manager/server/product-image-processor";
import type { ProductMediaRepository } from "@/features/product-manager/server/product-media.repository";
import type { ProductImageSource, ProductManagerImage } from "@/features/product-manager/server/product-media.types";
import { productMediaPolicy } from "@/features/product-manager/product-media-policy";

/** Coordinates media processing, Storage compensation, and ordered metadata without claiming cross-system atomicity. */
export class ProductMediaService {
  public constructor(
    private readonly repository: ProductMediaRepository,
    private readonly processor: ProductImageProcessor,
    private readonly storageService: StorageService,
    private readonly imageService: ImageService,
  ) {}

  public async list(productId: ProductId): Promise<ReadonlyArray<ProductManagerImage>> {
    const images = await this.repository.listByProductId(productId);
    return Promise.all(images.map(async (image) => ({
      altText: image.altText, height: image.height, id: image.id, position: image.position,
      previewUrl: (await this.imageService.resolveProductImage({ ...image, mimeType: "image/webp" })).url,
      width: image.width,
    })));
  }

  public async upload(productId: ProductId, title: string, source: ProductImageSource): Promise<ProductManagerImage> {
    if (source.size > productMediaPolicy.maximumSourceBytes) {
      throw new Error("El archivo supera el tamaño máximo permitido de 12 MiB.");
    }
    const processed = await this.processor.process(source);
    const imageId = randomUUID();
    const storageKey = `products/${productId}/${imageId}.webp`;

    await this.storageService.uploadProductImage({ bytes: processed.bytes, storageKey });
    try {
      const image = await this.repository.createMetadata({ altTextPrefix: title.trim(), height: processed.height, id: imageId, productId, storageKey, width: processed.width });
      return {
        altText: image.altText, height: image.height, id: image.id, position: image.position,
        previewUrl: (await this.imageService.resolveProductImage({ ...image, mimeType: "image/webp" })).url,
        width: image.width,
      };
    } catch (error) {
      try {
        await this.storageService.deleteProductImage(storageKey);
      } catch {
        // This is deliberately server-only: the deterministic key lets operations remediate an orphan without revealing it to the operator.
        console.error("Product media upload compensation failed.", { imageId, productId });
      }
      throw error;
    }
  }

  public async updateAltText(productId: ProductId, imageId: string, altText: string): Promise<void> {
    if (!altText.trim()) throw new Error("La descripción alternativa es obligatoria.");
    await this.repository.updateAltText(productId, imageId, altText.trim());
  }

  public reorder(productId: ProductId, imageIds: ReadonlyArray<string>): Promise<void> { return this.repository.reorder(productId, imageIds); }

  public async remove(productId: ProductId, imageId: string): Promise<void> {
    const image = await this.repository.findById(productId, imageId);
    if (!image) throw new Error("La foto ya no existe.");
    await this.storageService.deleteProductImage(image.storageKey);
    try {
      await this.repository.deleteMetadata(productId, imageId);
    } catch (error) {
      // The metadata retains the deterministic key, so the same explicit remove action can safely retry the coordinated deletion.
      console.error("Product media metadata removal failed after Storage deletion.", { imageId, productId });
      throw error;
    }
  }
}
