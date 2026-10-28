import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProductManualSaleRepository, ManualSaleExpectedStatus } from "@/features/product-manager/server/product-manual-sale.repository";
import type { ProductSlug } from "@/features/catalog/server/product.types";
import type { Database } from "@/infrastructure/supabase/database.types";

/** Keeps manual-sale persistence on the caller's authenticated session context. */
export class SupabaseProductManualSaleRepository implements ProductManualSaleRepository {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async markSold(productId: string, expectedStatus: ManualSaleExpectedStatus): Promise<ProductSlug> {
    const { data, error } = await this.client.rpc("admin_mark_product_sold", {
      p_product_id: productId,
      p_expected_status: expectedStatus,
      p_external_payment_verified: true,
    });

    if (error || !data?.[0]?.slug) throw new Error("Manual Product sale could not be recorded.");
    return data[0].slug as ProductSlug;
  }
}
