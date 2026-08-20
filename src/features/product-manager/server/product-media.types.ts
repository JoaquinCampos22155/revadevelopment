import type { ProductId } from "@/features/catalog/server/product.types";

/** Delivery-safe Product media used only by the authenticated Product Manager. */
export type ProductManagerImage = Readonly<{
  altText: string;
  height: number;
  id: string;
  position: number;
  previewUrl: string;
  width: number;
}>;

/** Keeps source-photo bytes at the server boundary until processing completes. */
export type ProductImageSource = Readonly<{
  bytes: Uint8Array;
  declaredMimeType: string;
  size: number;
}>;

export type ProcessedProductImage = Readonly<{
  bytes: Uint8Array;
  height: number;
  mimeType: "image/webp";
  width: number;
}>;

export type ProductImageRecord = Readonly<{
  altText: string;
  createdAt: Date;
  height: number;
  id: string;
  position: number;
  productId: ProductId;
  storageKey: string;
  width: number;
}>;
