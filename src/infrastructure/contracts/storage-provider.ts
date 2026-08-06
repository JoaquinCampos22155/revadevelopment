/** Represents a provider-neutral storage key that business data may safely persist. */
export type StorageKey = string;

/** Describes a short-lived upload capability without exposing a provider SDK to feature code. */
export type StorageUploadIntent = Readonly<{
  expiresAt: Date;
  storageKey: StorageKey;
  uploadUrl: string;
}>;

/** Defines the storage operations that future provider adapters must implement. */
export interface StorageProvider {
  createUploadIntent(storageKey: StorageKey): Promise<StorageUploadIntent>;
  resolvePublicUrl(storageKey: StorageKey): Promise<string>;
}
