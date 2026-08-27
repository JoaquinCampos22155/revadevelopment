import type { ProductManagerRepository } from "@/features/product-manager/server/product-manager.repository";
import type { ProductDraft, ProductDraftId, ProductManagerProductPage } from "@/features/product-manager/server/product-draft.types";

export const productManagerPageSize = 25;

/** Coordinates Product Manager's operational reads without mixing them with draft persistence. */
export class ProductManagerService {
  public constructor(private readonly repository: ProductManagerRepository) {}

  public findById(id: ProductDraftId): Promise<ProductDraft | null> {
    return this.repository.findById(id);
  }

  public list(page: number): Promise<ProductManagerProductPage> {
    const normalizedPage = Number.isSafeInteger(page) && page > 0 ? page : 1;
    return this.repository.list({
      limit: productManagerPageSize + 1,
      offset: (normalizedPage - 1) * productManagerPageSize,
    });
  }
}
