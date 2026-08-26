import { SharpProductImageProcessor } from "@/infrastructure/images/sharp-product-image-processor";
import { createSupabaseServerActionClient } from "@/infrastructure/supabase/server-action-client";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { SupabaseProductImageService } from "@/infrastructure/supabase/supabase-product-image.service";
import { SupabaseProductMediaRepository } from "@/infrastructure/supabase/supabase-product-media.repository";
import { SupabaseStorageService } from "@/infrastructure/supabase/supabase-storage.service";
import { ProductMediaService } from "@/features/product-manager/server/product-media.service";

/** Composes media-preview reads with the read-only SSR session context. */
export async function createProductMediaReadService(): Promise<ProductMediaService> {
  const client = await createSupabaseServerClient();
  const storage = new SupabaseStorageService(client);
  return new ProductMediaService(new SupabaseProductMediaRepository(client), new SharpProductImageProcessor(), storage, new SupabaseProductImageService(storage));
}

/** Composes media mutations with the verified, writable caller session rather than a privileged client. */
export async function createProductMediaActionService(): Promise<ProductMediaService> {
  const client = await createSupabaseServerActionClient();
  const storage = new SupabaseStorageService(client);
  return new ProductMediaService(new SupabaseProductMediaRepository(client), new SharpProductImageProcessor(), storage, new SupabaseProductImageService(storage));
}
