import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProductRecommendationRepository } from "@/features/merchandising/server/product-recommendation.repository";
import type { ProductRecommendation, ProductRecommendationStatus } from "@/features/merchandising/server/product-recommendation.types";
import type { Database } from "@/infrastructure/supabase/database.types";

type RecommendationRow = Database["public"]["Functions"]["list_product_recommendations"]["Returns"][number];
type RecommendationStatusRow = Database["public"]["Functions"]["get_product_recommendation_status"]["Returns"][number];

function requireText(value: string | null, field: string): string {
  if (!value) throw new Error(`Merchandising persistence returned no ${field}.`);
  return value;
}

function mapRecommendation(row: RecommendationRow): ProductRecommendation {
  if (!row.recommendation_position || row.recommendation_position < 1) {
    throw new Error("Merchandising persistence returned an invalid position.");
  }

  return {
    position: row.recommendation_position,
    productId: requireText(row.product_id, "Product id"),
    sku: requireText(row.sku, "SKU"),
    title: requireText(row.title, "Product title"),
  };
}

/** Uses narrow session-bound RPCs; it never exposes the relation to presentation. */
export class SupabaseProductRecommendationRepository implements ProductRecommendationRepository {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async add(productId: string): Promise<number> {
    const { data, error } = await this.client.rpc("add_product_recommendation", { p_product_id: productId });
    if (error || !data?.[0]?.recommendation_position) throw new Error("The Product could not be recommended.");
    return data[0].recommendation_position;
  }

  public async getStatus(productId: string): Promise<ProductRecommendationStatus | null> {
    const { data, error } = await this.client.rpc("get_product_recommendation_status", { p_product_id: productId });
    if (error) throw new Error("The recommendation status could not be read.");
    const row: RecommendationStatusRow | undefined = data?.[0];
    if (!row) return null;
    return { eligible: row.is_eligible === true, position: row.recommendation_position };
  }

  public async list(): Promise<ReadonlyArray<ProductRecommendation>> {
    const { data, error } = await this.client.rpc("list_product_recommendations");
    if (error) throw new Error("The recommendations could not be read.");
    return data.map(mapRecommendation);
  }

  public async remove(productId: string): Promise<void> {
    const { error } = await this.client.rpc("remove_product_recommendation", { p_product_id: productId });
    if (error) throw new Error("The Product recommendation could not be removed.");
  }

  public async reorder(productIds: ReadonlyArray<string>): Promise<void> {
    const { error } = await this.client.rpc("reorder_product_recommendations", { p_product_ids: [...productIds] });
    if (error) throw new Error("The recommendation order could not be saved.");
  }
}
