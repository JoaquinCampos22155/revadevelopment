import type {
  ChangeProductStatusInput,
  CreateProductDraftInput,
  ListPublishedProductsInput,
  Product,
  ProductId,
  ProductSlug,
  PublishedProduct,
  PublishedProductPreview,
  UpdateProductDraftInput,
} from "@/features/catalog/server/product.types";

/** Owns unique-garment lifecycle rules and the published product contract consumed by public routes. */
export interface ProductService {
  changeStatus(input: ChangeProductStatusInput): Promise<Product>;
  createDraft(input: CreateProductDraftInput): Promise<Product>;
  getPublishedBySlug(slug: ProductSlug): Promise<PublishedProduct | null>;
  listPublished(input?: ListPublishedProductsInput): Promise<ReadonlyArray<PublishedProductPreview>>;
  updateDraft(input: UpdateProductDraftInput): Promise<Product>;
  getById(id: ProductId): Promise<Product | null>;
}
