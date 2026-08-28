import { SupabaseProductRecommendationRepository } from "@/infrastructure/supabase/supabase-product-recommendation.repository";
import { createSupabaseServerActionClient } from "@/infrastructure/supabase/server-action-client";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

import { ProductRecommendationService } from "@/features/merchandising/server/product-recommendation.service";

/** Composes read operations with the current caller's non-privileged SSR session. */
export async function createProductRecommendationReadService(): Promise<ProductRecommendationService> {
  return new ProductRecommendationService(new SupabaseProductRecommendationRepository(await createSupabaseServerClient()));
}

/** Composes mutations with writable cookies while preserving the caller JWT for PostgreSQL authorization. */
export async function createProductRecommendationActionService(): Promise<ProductRecommendationService> {
  return new ProductRecommendationService(new SupabaseProductRecommendationRepository(await createSupabaseServerActionClient()));
}
