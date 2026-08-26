import type { ProductId, ProductSlug } from "@/features/catalog/server/product.types";

/** Keeps lifecycle persistence separate from editable draft facts and public reads. */
export interface ProductPublicationRepository {
  beginUnpublish(productId: ProductId): Promise<void>;
  completePublication(productId: ProductId): Promise<ProductSlug>;
  completeUnpublish(productId: ProductId): Promise<ProductSlug>;
  getReadiness(productId: ProductId): Promise<ReadonlyArray<string>>;
  preparePublication(productId: ProductId): Promise<ProductSlug>;
}
