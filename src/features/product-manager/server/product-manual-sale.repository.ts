import type { ProductSlug } from "@/features/catalog/server/product.types";

export type ManualSaleExpectedStatus = "draft" | "published";

/** Performs only the dedicated, audited manual external-sale transition. */
export interface ProductManualSaleRepository {
  markSold(productId: string, expectedStatus: ManualSaleExpectedStatus): Promise<ProductSlug>;
}
