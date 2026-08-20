import { SharpProductImageProcessor } from "@/infrastructure/images/sharp-product-image-processor";
import { createSupabaseServerActionClient } from "@/infrastructure/supabase/server-action-client";
import { SupabaseProductImageService } from "@/infrastructure/supabase/supabase-product-image.service";
import { SupabaseProductMediaRepository } from "@/infrastructure/supabase/supabase-product-media.repository";
import { SupabaseStorageService } from "@/infrastructure/supabase/supabase-storage.service";
import { ProductMediaService } from "@/features/product-manager/server/product-media.service";

/** Composes media mutations with the verified, writable caller session rather than a privileged client. */
export async function createProductMediaService(): Promise<ProductMediaService> {
  const client = await createSupabaseServerActionClient();
  const storage = new SupabaseStorageService(client);
  return new ProductMediaService(new SupabaseProductMediaRepository(client), new SharpProductImageProcessor(), storage, new SupabaseProductImageService(storage));
}
