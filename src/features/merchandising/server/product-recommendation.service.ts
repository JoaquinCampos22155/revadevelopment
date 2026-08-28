import type { ProductRecommendationRepository } from "@/features/merchandising/server/product-recommendation.repository";
import type { ProductRecommendation, ProductRecommendationStatus } from "@/features/merchandising/server/product-recommendation.types";

/** Coordinates bounded editorial recommendations; availability remains enforced by PostgreSQL. */
export class ProductRecommendationService {
  public constructor(private readonly repository: ProductRecommendationRepository) {}

  public add(productId: string): Promise<number> {
    return this.repository.add(productId);
  }

  public getStatus(productId: string): Promise<ProductRecommendationStatus | null> {
    return this.repository.getStatus(productId);
  }

  public list(): Promise<ReadonlyArray<ProductRecommendation>> {
    return this.repository.list();
  }

  public remove(productId: string): Promise<void> {
    return this.repository.remove(productId);
  }

  public reorder(productIds: ReadonlyArray<string>): Promise<void> {
    if (new Set(productIds).size !== productIds.length || productIds.some((id) => !id)) {
      throw new Error("The recommendation order is invalid.");
    }

    return this.repository.reorder(productIds);
  }
}
