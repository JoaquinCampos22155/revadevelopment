import type {
  CreatedProductDraft,
  CreateProductDraftInput,
  ProductDraft,
  ProductDraftId,
  ProductDraftSummary,
  SaveProductDraftInput,
} from "@/features/product-manager/server/product-draft.types";

/**
 * Defines Product Manager's internal persistence boundary. Public catalog reads
 * stay in ProductRepository because they have a different contract and context.
 */
export interface ProductDraftRepository {
  createFromIntake(input: CreateProductDraftInput & Readonly<{ slug: string }>): Promise<CreatedProductDraft>;
  findDraftById(id: ProductDraftId): Promise<ProductDraft | null>;
  listDrafts(): Promise<ReadonlyArray<ProductDraftSummary>>;
  save(input: SaveProductDraftInput): Promise<void>;
}
