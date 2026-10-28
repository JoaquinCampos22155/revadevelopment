import type {
  ProductDraft,
  ProductDraftId,
  ProductManagerProductPage,
} from "@/features/product-manager/server/product-draft.types";
import type { ProductManagerSort } from "@/features/product-manager/product-manager-listing";

/** Defines the bounded internal read surface for Product Manager selection and inspection. */
export interface ProductManagerRepository {
  findById(id: ProductDraftId): Promise<ProductDraft | null>;
  list(input: Readonly<{ limit: number; offset: number; search: string; sort: ProductManagerSort | null }>): Promise<ProductManagerProductPage>;
}
