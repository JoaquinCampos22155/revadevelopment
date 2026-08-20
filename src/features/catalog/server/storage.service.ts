/** Defines server-owned Product media object operations without exposing provider SDKs to features. */
export interface StorageService {
  createProductImagePreviewUrl(storageKey: string): Promise<string>;
  deleteProductImage(storageKey: string): Promise<void>;
  uploadProductImage(input: Readonly<{ bytes: Uint8Array; storageKey: string }>): Promise<void>;
}
