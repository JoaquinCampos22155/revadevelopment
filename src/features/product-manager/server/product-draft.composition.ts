import { SupabaseProductDraftRepository } from "@/infrastructure/supabase/supabase-product-draft.repository";
import { createSupabaseServerActionClient } from "@/infrastructure/supabase/server-action-client";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

import { ProductDraftService } from "@/features/product-manager/server/product-draft.service";

/** Composes the read service with the current request's non-privileged SSR context. */
export async function createProductDraftReadService(): Promise<ProductDraftService> {
  const client = await createSupabaseServerClient();
  return new ProductDraftService(new SupabaseProductDraftRepository(client));
}

/** Composes draft mutations with writable session cookies and the caller's JWT. */
export async function createProductDraftActionService(): Promise<ProductDraftService> {
  const client = await createSupabaseServerActionClient();
  return new ProductDraftService(new SupabaseProductDraftRepository(client));
}
