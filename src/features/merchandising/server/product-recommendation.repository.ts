import type { ProductRecommendation, ProductRecommendationStatus } from "@/features/merchandising/server/product-recommendation.types";

/** Defines the narrow internal merchandising boundary without exposing its table to UI code. */
export interface ProductRecommendationRepository {
  add(productId: string): Promise<number>;
  getStatus(productId: string): Promise<ProductRecommendationStatus | null>;
  list(): Promise<ReadonlyArray<ProductRecommendation>>;
  remove(productId: string): Promise<void>;
  reorder(productIds: ReadonlyArray<string>): Promise<void>;
}
