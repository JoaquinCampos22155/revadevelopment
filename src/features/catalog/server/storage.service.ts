/** Defines server-owned Product media object operations without exposing provider SDKs to features. */
export interface StorageService {
  copyProductImageToPublic(storageKey: string, imageId: string): Promise<void>;
  createProductImagePreviewUrl(storageKey: string): Promise<string>;
  createPublicProductImageUrl(imageId: string): string;
  deletePublicProductImage(imageId: string): Promise<void>;
  deleteProductImage(storageKey: string): Promise<void>;
  hasPublicProductImage(imageId: string): Promise<boolean>;
  uploadProductImage(input: Readonly<{ bytes: Uint8Array; storageKey: string }>): Promise<void>;
}
