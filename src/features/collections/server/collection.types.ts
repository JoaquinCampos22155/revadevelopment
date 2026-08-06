import type { ProductId } from "@/features/catalog/server/product.types";

/** Identifies an editorial collection independently from persistence. */
export type CollectionId = string;

/** Identifies a public, human-readable collection route. */
export type CollectionSlug = string;

/** Keeps collection publication separate from the lifecycle of its products. */
export type CollectionStatus = "draft" | "published" | "archived";

/** Represents an editorial grouping that references products without owning their images. */
export type Collection = Readonly<{
  description: string;
  id: CollectionId;
  name: string;
  slug: CollectionSlug;
  status: CollectionStatus;
}>;

/** Represents a product's ordered membership in an editorial collection. */
export type CollectionProduct = Readonly<{
  collectionId: CollectionId;
  productId: ProductId;
  sortOrder: number;
}>;

/** Supplies the facts needed to create an unpublished editorial collection. */
export type CreateCollectionInput = Readonly<{
  description: string;
  name: string;
  slug: CollectionSlug;
}>;

/** Makes collection membership changes explicit and independently ordered. */
export type SetCollectionProductsInput = Readonly<{
  collectionId: CollectionId;
  products: ReadonlyArray<CollectionProduct>;
}>;
