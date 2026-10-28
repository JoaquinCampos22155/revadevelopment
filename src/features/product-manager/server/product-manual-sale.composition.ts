import { SupabaseProductManualSaleRepository } from "@/infrastructure/supabase/supabase-product-manual-sale.repository";
import { createSupabaseServerActionClient } from "@/infrastructure/supabase/server-action-client";

/** Binds the manual lifecycle operation to the current Admin session. */
export async function createProductManualSaleActionRepository(): Promise<SupabaseProductManualSaleRepository> {
  return new SupabaseProductManualSaleRepository(await createSupabaseServerActionClient());
}
