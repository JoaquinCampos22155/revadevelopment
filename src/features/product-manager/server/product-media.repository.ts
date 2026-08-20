import type { ProductId } from "@/features/catalog/server/product.types";
import type { ProductImageRecord } from "@/features/product-manager/server/product-media.types";

/** Keeps Product Manager media persistence separate from the public Product read repository. */
export interface ProductMediaRepository {
  createMetadata(input: Readonly<{ altTextPrefix: string; height: number; id: string; productId: ProductId; storageKey: string; width: number }>): Promise<ProductImageRecord>;
  deleteMetadata(productId: ProductId, imageId: string): Promise<void>;
  findById(productId: ProductId, imageId: string): Promise<ProductImageRecord | null>;
  listByProductId(productId: ProductId): Promise<ReadonlyArray<ProductImageRecord>>;
  reorder(productId: ProductId, imageIds: ReadonlyArray<string>): Promise<void>;
  updateAltText(productId: ProductId, imageId: string, altText: string): Promise<void>;
}
