import { SupabaseProductMediaRepository } from "@/infrastructure/supabase/supabase-product-media.repository";
import { SupabaseProductPublicationRepository } from "@/infrastructure/supabase/supabase-product-publication.repository";
import { SupabaseStorageService } from "@/infrastructure/supabase/supabase-storage.service";
import { createSupabaseServerActionClient } from "@/infrastructure/supabase/server-action-client";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { ProductPublicationService } from "@/features/product-manager/server/product-publication.service";

/** Binds publication-readiness checks to the read-only SSR session context. */
export async function createProductPublicationReadService(): Promise<ProductPublicationService> {
  const client = await createSupabaseServerClient();
  return new ProductPublicationService(new SupabaseProductPublicationRepository(client), new SupabaseProductMediaRepository(client), new SupabaseStorageService(client));
}

/** Binds publication lifecycle mutations to the writable Server Action session context. */
export async function createProductPublicationActionService(): Promise<ProductPublicationService> {
  const client = await createSupabaseServerActionClient();
  return new ProductPublicationService(new SupabaseProductPublicationRepository(client), new SupabaseProductMediaRepository(client), new SupabaseStorageService(client));
}
