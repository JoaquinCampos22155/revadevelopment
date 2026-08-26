import type { SupabaseClient } from "@supabase/supabase-js";

import { type ConditionRating } from "@/features/catalog/condition";
import { isAudience, type Audience } from "@/features/catalog/audiences";
import type { PublicImageService } from "@/features/catalog/server/public-image.service";
import type { ProductRepository } from "@/features/catalog/server/product.repository";
import type {
  ProductMeasurements,
  ProductSlug,
  PublishedProduct,
  PublishedProductImage,
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

function mapAudience(value: string | null): Audience {
  if (value && isAudience(value)) return value;
  throw new Error("The public Product projection returned an invalid audience.");
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

function mapImage(row: Readonly<{alt_text:string|null;height:number|null;image_id:string|null;position:number|null;width:number|null}>): PublishedProductImage {
  if (!row.image_id || !row.alt_text || !row.width || !row.height || !row.position) throw new Error("The public Product projection returned invalid image data.");
  return {altText:row.alt_text,height:row.height,id:row.image_id,position:row.position,width:row.width};
}

function mapPreview(row: PublishedProductPreviewRow, imageService: PublicImageService): PublishedProductPreview {
  return {
    audience: mapAudience(row.audience),
    brand: row.brand,
    color: row.color,
    conditionRating: mapConditionRating(row.condition_rating),
    garmentType: requireText(row.garment_type, "garment type"),
    image: row.primary_image_id ? imageService.resolvePublishedProductImage(mapImage({alt_text:row.primary_image_alt_text,height:row.primary_image_height,image_id:row.primary_image_id,position:1,width:row.primary_image_width})) : null,
    price: mapMoney(row.price),
    sizeLabel: row.size_label,
    slug: requireText(row.slug, "slug"),
    title: requireText(row.title, "title"),
  };
}

function mapDetail(row: PublishedProductDetailRow, images: ReadonlyArray<PublishedProductImage>, imageService: PublicImageService): PublishedProduct {
  return {
    audience: mapAudience(row.audience),
    brand: row.brand,
    color: row.color,
    conditionNotes: row.condition_notes,
    conditionRating: mapConditionRating(row.condition_rating),
    description: requireText(row.description, "description"),
    garmentType: requireText(row.garment_type, "garment type"),
    images: images.map((image) => imageService.resolvePublishedProductImage(image)),
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
  public constructor(private readonly client: SupabaseClient<Database>, private readonly imageService: PublicImageService) {}

  public async findPublishedBySlug(
    slug: ProductSlug,
  ): Promise<PublishedProduct | null> {
    const { data, error } = await this.client
      .schema("api")
      .from("published_product_details")
      .select(
        "slug, title, price, audience, brand, garment_type, color, size_label, condition_rating, description, material_details, measurements, condition_notes",
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error("The public Product detail could not be read.");
    }

    if (!data) return null;
    const { data: imageRows, error: imageError } = await this.client.schema("api").from("published_product_images").select("image_id, alt_text, position, width, height").eq("product_slug", slug).order("position");
    if (imageError) throw new Error("The public Product images could not be read.");
    return mapDetail(data, imageRows.map(mapImage), this.imageService);
  }

  public async listPublished(): Promise<ReadonlyArray<PublishedProductPreview>> {
    const { data, error } = await this.client
      .schema("api")
      .from("published_product_previews")
      .select(
        "slug, title, price, audience, brand, garment_type, color, size_label, condition_rating, primary_image_id, primary_image_alt_text, primary_image_width, primary_image_height",
      )
      .order("title", { ascending: true });

    if (error) {
      throw new Error("The public Product catalog could not be read.");
    }

    return data.map((row) => mapPreview(row, this.imageService));
  }
}
