import type {
  Product,
  ProductId,
  ProductSlug,
  PublishedProduct,
  PublishedProductPreview,
  ListPublishedProductsInput,
} from "@/features/catalog/server/product.types";

/** Defines the persistence boundary required by the Product domain without naming a provider. */
export interface ProductRepository {
  findById(id: ProductId): Promise<Product | null>;
  findPublishedBySlug(slug: ProductSlug): Promise<PublishedProduct | null>;
  listPublished(input: ListPublishedProductsInput): Promise<ReadonlyArray<PublishedProductPreview>>;
  save(product: Product): Promise<Product>;
}
