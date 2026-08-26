import { SupabasePublicProductRepository } from "@/infrastructure/supabase/supabase-public-product.repository";
import { SupabasePublicProductImageService } from "@/infrastructure/supabase/supabase-public-product-image.service";
import { SupabaseStorageService } from "@/infrastructure/supabase/supabase-storage.service";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

import { ProductService } from "@/features/catalog/server/product.service";

/**
 * Composes the request-scoped public Product read path without giving routes or
 * components a Supabase client. The publishable context can read only the api
 * projections, whether the visitor is anonymous or already authenticated.
 */
export async function createPublicProductService(): Promise<ProductService> {
  const client = await createSupabaseServerClient();
  const productRepository = new SupabasePublicProductRepository(client, new SupabasePublicProductImageService(new SupabaseStorageService(client)));

  return new ProductService(productRepository);
}
