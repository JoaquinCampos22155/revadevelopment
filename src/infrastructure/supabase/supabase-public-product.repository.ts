import type { SupabaseClient } from "@supabase/supabase-js";

import { type ConditionRating } from "@/features/catalog/condition";
import type { ProductRepository } from "@/features/catalog/server/product.repository";
import type {
  ProductMeasurements,
  ProductSlug,
  PublishedProduct,
  PublishedProductPreview,
} from "@/features/catalog/server/product.types";
import type { Money } from "@/types/money";
import type { Database, Json } from "@/infrastructure/supabase/database.types";

type PublishedProductPreviewRow =
  Database["api"]["Views"]["published_product_previews"]["Row"];
type PublishedProductDetailRow =
  Database["api"]["Views"]["published_product_details"]["Row"];

function requireText(value: string | null, field: string): string {
  if (!value) {
    throw new Error(`The public Product projection returned no ${field}.`);
  }

  return value;
}

function mapConditionRating(value: number | null): ConditionRating {
  if (value === 0 || value === 1 || value === 2 || value === 3) {
    return value;
  }

  throw new Error("The public Product projection returned an invalid condition rating.");
}

function mapMoney(value: string | null): Money {
  const amount = requireText(value, "price");

  if (!/^\d+\.\d{2}$/.test(amount)) {
    throw new Error("The public Product projection returned a non-canonical price.");
  }

  return { amount, currency: "GTQ" };
}

function mapMeasurements(value: Json | null): ProductMeasurements | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The public Product projection returned invalid measurements.");
  }

  const measurements = Object.entries(value);

  if (measurements.some(([, measurement]) => typeof measurement !== "string")) {
    throw new Error("The public Product projection returned non-text measurements.");
  }

  return Object.fromEntries(measurements) as ProductMeasurements;
}

function mapPreview(row: PublishedProductPreviewRow): PublishedProductPreview {
  return {
    brand: row.brand,
    conditionRating: mapConditionRating(row.condition_rating),
    // Storage is intentionally absent. Presentation keeps its editorial image
    // fallback until ImageService can resolve real delivery-safe images.
    image: null,
    price: mapMoney(row.price),
    slug: requireText(row.slug, "slug"),
    title: requireText(row.title, "title"),
  };
}

function mapDetail(row: PublishedProductDetailRow): PublishedProduct {
  return {
    brand: row.brand,
    color: row.color,
    conditionNotes: row.condition_notes,
    conditionRating: mapConditionRating(row.condition_rating),
    description: requireText(row.description, "description"),
    garmentType: requireText(row.garment_type, "garment type"),
    // See the preview mapping: no raw storage identity may cross this boundary.
    images: [],
    materialDetails: row.material_details,
    measurements: mapMeasurements(row.measurements),
    price: mapMoney(row.price),
    sizeLabel: row.size_label,
    slug: requireText(row.slug, "slug"),
    title: requireText(row.title, "title"),
  };
}

/**
 * Adapts only REVA's intentionally public api projections. It cannot query a
 * base Product table, which keeps anonymous reads independent from RLS bypasses
 * and makes the projection allowlist the enforceable public contract.
 */
export class SupabasePublicProductRepository implements ProductRepository {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async findPublishedBySlug(
    slug: ProductSlug,
  ): Promise<PublishedProduct | null> {
    const { data, error } = await this.client
      .schema("api")
      .from("published_product_details")
      .select(
        "slug, title, price, brand, garment_type, color, size_label, condition_rating, description, material_details, measurements, condition_notes",
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error("The public Product detail could not be read.");
    }

    return data ? mapDetail(data) : null;
  }

  public async listPublished(): Promise<ReadonlyArray<PublishedProductPreview>> {
    const { data, error } = await this.client
      .schema("api")
      .from("published_product_previews")
      .select(
        "slug, title, price, brand, garment_type, color, size_label, condition_rating",
      )
      .order("title", { ascending: true });

    if (error) {
      throw new Error("The public Product catalog could not be read.");
    }

    return data.map(mapPreview);
  }
}
