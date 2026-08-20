import sharp from "sharp";

import { productMediaPolicy } from "@/features/product-manager/product-media-policy";
import type { ProductImageProcessor } from "@/features/product-manager/server/product-image-processor";
import type { ProcessedProductImage, ProductImageSource } from "@/features/product-manager/server/product-media.types";

/** Applies REVA's evidence-backed output policy at the only trusted image-processing boundary. */
export class SharpProductImageProcessor implements ProductImageProcessor {
  public async process(source: ProductImageSource): Promise<ProcessedProductImage> {
    let metadata: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
    try {
      metadata = await sharp(source.bytes, { limitInputPixels: productMediaPolicy.maximumDecodedPixels }).metadata();
    } catch {
      throw new Error("La foto no es un JPG o PNG válido.");
    }

    if (metadata.format !== "jpeg" && metadata.format !== "png") {
      throw new Error("Por ahora solo aceptamos fotos JPG, JPEG o PNG. Convierte HEIC antes de subirla.");
    }
    if ((metadata.pages ?? 1) !== 1) throw new Error("La foto debe ser una imagen estática.");

    const { data, info } = await sharp(source.bytes, { limitInputPixels: productMediaPolicy.maximumDecodedPixels })
      .autoOrient()
      .resize({ height: productMediaPolicy.maximumLongEdge, width: productMediaPolicy.maximumLongEdge, fit: "inside", withoutEnlargement: true })
      .webp({ quality: productMediaPolicy.webpQuality })
      .toBuffer({ resolveWithObject: true });

    return { bytes: data, height: info.height, mimeType: "image/webp", width: info.width };
  }
}
