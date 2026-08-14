import type { ProductId } from "@/features/catalog/server/product.types";

/** Identifies an editorial Collection independently from persistence. */
export type CollectionId = string;

/** Identifies a public, human-readable Collection route. */
export type CollectionSlug = string;

/** Keeps Collection publication separate from the Product commercial lifecycle. */
export type CollectionStatus = "draft" | "published" | "archived";

/** Represents a curated editorial landing page without independent media ownership. */
export type Collection = Readonly<{
  createdAt: Date;
  description: string;
  id: CollectionId;
  slug: CollectionSlug;
  status: CollectionStatus;
  title: string;
  updatedAt: Date;
}>;

/** Keeps manual Product ordering on the Collection relationship where it belongs. */
export type CollectionProduct = Readonly<{
  collectionId: CollectionId;
  position: number;
  productId: ProductId;
}>;

/** Supplies the facts needed to create an unpublished editorial Collection. */
export type CreateCollectionInput = Readonly<{
  description: string;
  slug: CollectionSlug;
  title: string;
}>;

/** Makes Collection membership changes explicit and independently ordered. */
export type SetCollectionProductsInput = Readonly<{
  collectionId: CollectionId;
  products: ReadonlyArray<CollectionProduct>;
}>;
