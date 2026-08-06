import type {
  Collection,
  CollectionId,
  CollectionProduct,
  CollectionSlug,
} from "@/features/collections/server/collection.types";

/** Defines collection persistence without allowing provider data to enter editorial business logic. */
export interface CollectionRepository {
  findPublishedBySlug(slug: CollectionSlug): Promise<Collection | null>;
  listPublished(): Promise<ReadonlyArray<Collection>>;
  replaceProducts(collectionId: CollectionId, products: ReadonlyArray<CollectionProduct>): Promise<void>;
  save(collection: Collection): Promise<Collection>;
}
