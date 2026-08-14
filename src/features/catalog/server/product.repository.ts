import type {
  ProductSlug,
  PublishedProduct,
  PublishedProductPreview,
} from "@/features/catalog/server/product.types";

/**
 * Defines only the published Product persistence boundary currently required.
 * Future admin writes will receive a separate repository once a real management
 * use case exists, so public reads cannot accidentally inherit write authority.
 */
export interface ProductRepository {
  findPublishedBySlug(slug: ProductSlug): Promise<PublishedProduct | null>;
  listPublished(): Promise<ReadonlyArray<PublishedProductPreview>>;
}
