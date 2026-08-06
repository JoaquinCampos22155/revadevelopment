import type {
  Collection,
  CollectionId,
  CollectionSlug,
  CreateCollectionInput,
  SetCollectionProductsInput,
} from "@/features/collections/server/collection.types";

/** Owns editorial collection behavior while preserving product ownership in the Product domain. */
export interface CollectionService {
  createDraft(input: CreateCollectionInput): Promise<Collection>;
  getPublishedBySlug(slug: CollectionSlug): Promise<Collection | null>;
  listPublished(): Promise<ReadonlyArray<Collection>>;
  publish(id: CollectionId): Promise<Collection>;
  setProducts(input: SetCollectionProductsInput): Promise<void>;
}
