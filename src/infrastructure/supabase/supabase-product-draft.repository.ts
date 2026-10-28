import type { SupabaseClient } from "@supabase/supabase-js";

import type { ConditionRating } from "@/features/catalog/condition";
import { isAudience, type Audience } from "@/features/catalog/audiences";
import { isGarmentType, type GarmentType } from "@/features/catalog/garment-types";
import { isProductSize, type ProductSize } from "@/features/catalog/sizes";
import type { IntakeItemId, IntakeSourceType } from "@/features/intake/server/intake.types";
import type { ProductMeasurements, ProductStatus } from "@/features/catalog/server/product.types";
import type { ProductDraftRepository } from "@/features/product-manager/server/product-draft.repository";
import type { ProductManagerRepository } from "@/features/product-manager/server/product-manager.repository";
import { buildProductManagerSearchPattern, normalizeProductManagerSearch, type ProductManagerSort } from "@/features/product-manager/product-manager-listing";
import type {
  CreatedProductDraft,
  CreateProductDraftInput,
  ProductDraft,
  ProductDraftId,
  ProductDraftSummary,
  ProductManagerProductPage,
  ProductManagerProductSummary,
  ProductManagerPrimaryImage,
  SaveProductDraftInput,
} from "@/features/product-manager/server/product-draft.types";
import type { Money } from "@/types/money";
import type { Database, Json } from "@/infrastructure/supabase/database.types";
import { SupabaseStorageService } from "@/infrastructure/supabase/supabase-storage.service";

type CreateDraftRow =
  Database["public"]["Functions"]["create_product_draft_from_intake"]["Returns"][number];
type DraftRow =
  Database["public"]["Functions"]["get_product_manager_draft"]["Returns"][number];
type DraftSummaryRow =
  Database["public"]["Functions"]["list_product_manager_drafts"]["Returns"][number];
type ProductManagerProductRow =
  Database["public"]["Functions"]["get_product_manager_product"]["Returns"][number];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];
type ProductManagerListingRow = Pick<ProductRow, "id" | "sku" | "title" | "status" | "price" | "published_at" | "public_media_ready_at" | "updated_at">;
type ProductManagerPrimaryImageRow = Pick<ProductImageRow, "id" | "product_id" | "storage_key" | "alt_text" | "width" | "height">;

type ProductStatusSegment = Readonly<{
  status: ProductStatus;
  publicMedia: "visible" | "hidden" | "any";
}>;

const moneyPattern = /^\d+\.\d{2}$/;

function requireText(value: unknown, field: string): string {
  if (typeof value !== "string" || !value) {
    throw new Error(`Product Manager persistence returned no ${field}.`);
  }

  return value;
}

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function mapMoney(value: unknown, field: string): Money | null {
  if (value === null || value === undefined) return null;

  const amount = requireText(value, field);

  if (!moneyPattern.test(amount)) {
    throw new Error(`Product Manager persistence returned a non-canonical ${field}.`);
  }

  return { amount, currency: "GTQ" };
}

function mapConditionRating(value: unknown): ConditionRating | null {
  if (value === null || value === undefined) return null;
  if (value === 1 || value === 2 || value === 3 || value === 4) return value;

  throw new Error("Product Manager persistence returned an invalid condition rating.");
}

function mapSourceType(value: unknown): IntakeSourceType {
  if (value === "sell" || value === "donate") return value;

  throw new Error("Product Manager persistence returned an invalid Intake source type.");
}

function mapGarmentType(value: unknown): GarmentType | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && isGarmentType(value)) return value;

  throw new Error("Product Manager persistence returned an unapproved garment type.");
}

function mapAudience(value: unknown): Audience | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && isAudience(value)) return value;

  throw new Error("Product Manager persistence returned an unapproved audience.");
}

function mapSizeLabel(value: unknown): ProductSize | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && isProductSize(value)) return value;

  throw new Error("Product Manager persistence returned an unapproved size label.");
}

function mapStatus(value: unknown): ProductStatus {
  if (
    value === "draft" ||
    value === "published" ||
    value === "reserved" ||
    value === "sold" ||
    value === "archived"
  ) {
    return value;
  }

  throw new Error("Product Manager persistence returned an invalid Product status.");
}

function mapMeasurements(value: Json | null): ProductMeasurements | null {
  if (value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Product Manager persistence returned invalid measurements.");
  }

  const entries = Object.entries(value);

  if (entries.some(([, measurement]) => typeof measurement !== "string")) {
    throw new Error("Product Manager persistence returned invalid measurements.");
  }

  return Object.fromEntries(entries) as ProductMeasurements;
}

function mapDraftSummary(row: DraftSummaryRow): ProductDraftSummary {
  return {
    id: requireText(row.id, "Product id"),
    sku: requireText(row.sku, "SKU"),
    status: mapStatus(row.status),
    title: requireText(row.title, "Product title"),
    updatedAt: new Date(requireText(row.updated_at, "update time")),
  };
}

function mapProductManagerProductSummary(row: ProductManagerListingRow, primaryImage: ProductManagerPrimaryImage | null): ProductManagerProductSummary {
  return {
    id: requireText(row.id, "Product id"),
    isPubliclyVisible: row.status === "published" && row.public_media_ready_at !== null,
    primaryImage,
    price: mapMoney(row.price === null ? null : row.price.toFixed(2), "selling price"),
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    sku: requireText(row.sku, "SKU"),
    status: mapStatus(row.status),
    title: requireText(row.title, "Product title"),
    updatedAt: new Date(row.updated_at),
  };
}

function mapDraft(row: DraftRow): ProductDraft {
  return {
    acquisitionCost: mapMoney(row.acquisition_cost, "acquisition cost"),
    audience: mapAudience(row.audience),
    brand: nullableText(row.brand),
    color: nullableText(row.color),
    conditionNotes: nullableText(row.condition_notes),
    conditionRating: mapConditionRating(row.condition_rating),
    description: nullableText(row.description),
    garmentType: mapGarmentType(row.garment_type),
    id: requireText(row.id, "Product id"),
    intakeItemId: requireText(row.intake_item_id, "Intake id") as IntakeItemId,
    materialDetails: nullableText(row.material_details),
    measurements: mapMeasurements(row.measurements),
    price: mapMoney(row.price, "selling price"),
    receivedAt: requireText(row.received_at, "receipt date"),
    sizeLabel: mapSizeLabel(row.size_label),
    sku: requireText(row.sku, "SKU"),
    sourceType: mapSourceType(row.source_type),
    status: mapStatus(row.status),
    title: requireText(row.title, "Product title"),
    updatedAt: new Date(requireText(row.updated_at, "update time")),
  };
}

/**
 * Adapts Product Manager's session-bound, administrator-only RPC contract.
 * The functions are SECURITY INVOKER, so this adapter cannot elevate a caller
 * beyond the existing grants and RLS policies.
 */
export class SupabaseProductDraftRepository implements ProductDraftRepository, ProductManagerRepository {
  private readonly storage: SupabaseStorageService;

  public constructor(private readonly client: SupabaseClient<Database>) {
    this.storage = new SupabaseStorageService(client);
  }

  public async createFromIntake(
    input: CreateProductDraftInput & Readonly<{ slug: string }>,
  ): Promise<CreatedProductDraft> {
    const { data, error } = await this.client.rpc("create_product_draft_from_intake", {
      p_acquisition_cost: input.acquisitionCost?.amount ?? "",
      p_audience: input.audience ?? "",
      p_brand: input.brand ?? "",
      p_color: input.color ?? "",
      p_condition_notes: input.conditionNotes ?? "",
      p_condition_rating: input.conditionRating?.toString() ?? "",
      p_description: input.description ?? "",
      p_garment_type: input.garmentType ?? "",
      p_material_details: input.materialDetails ?? "",
      p_measurements: input.measurements,
      p_price: input.price?.amount ?? "",
      p_received_at: input.receivedAt,
      p_size_label: input.sizeLabel ?? "",
      p_slug: input.slug,
      p_source_profile_id: "",
      p_source_type: input.sourceType,
      p_title: input.title.trim(),
    });

    if (error || !data?.[0]) {
      throw new Error("The Product draft could not be created.");
    }

    const row: CreateDraftRow = data[0];

    return {
      id: requireText(row.product_id, "Product id"),
      intakeItemId: requireText(row.intake_item_id, "Intake id") as IntakeItemId,
      sku: requireText(row.sku, "SKU"),
    };
  }

  public async findDraftById(id: ProductDraftId): Promise<ProductDraft | null> {
    const { data, error } = await this.client.rpc("get_product_manager_draft", {
      p_product_id: id,
    });

    if (error) {
      throw new Error("The Product draft could not be read.");
    }

    return data?.[0] ? mapDraft(data[0]) : null;
  }

  public async findById(id: ProductDraftId): Promise<ProductDraft | null> {
    const { data, error } = await this.client.rpc("get_product_manager_product", {
      p_product_id: id,
    });

    if (error) {
      throw new Error("The Product could not be read.");
    }

    return data?.[0] ? mapDraft(data[0] as ProductManagerProductRow) : null;
  }

  public async listDrafts(): Promise<ReadonlyArray<ProductDraftSummary>> {
    const { data, error } = await this.client.rpc("list_product_manager_drafts");

    if (error) {
      throw new Error("Product drafts could not be read.");
    }

    return data.map(mapDraftSummary);
  }

  public async list(input: Readonly<{ limit: number; offset: number; search: string; sort: ProductManagerSort | null }>): Promise<ProductManagerProductPage> {
    const search = normalizeProductManagerSearch(input.search);
    let rows: ReadonlyArray<ProductManagerListingRow>;

    if (input.sort === "status-priority" || input.sort === "status-reverse") {
      rows = await this.listByStatusPriority({ ...input, sort: input.sort }, search);
    } else {
      rows = await this.listByColumn(input, search);
    }

    const hasNextPage = rows.length > 25;
    const pageRows = hasNextPage ? rows.slice(0, 25) : rows;
    const primaryImages = await this.listPrimaryImages(pageRows);
    const items = pageRows.map((row) => mapProductManagerProductSummary(row, primaryImages.get(row.id) ?? null));

    return { hasNextPage, items };
  }

  private async listByColumn(
    input: Readonly<{ limit: number; offset: number; sort: ProductManagerSort | null }>,
    search: string,
  ): Promise<ReadonlyArray<ProductManagerListingRow>> {
    let query = this.client.from("products").select("id, sku, title, status, price, published_at, public_media_ready_at, updated_at");
    query = this.addSearch(query, search);

    if (input.sort === "product-asc") query = query.order("title").order("sku").order("id");
    else if (input.sort === "product-desc") query = query.order("title", { ascending: false }).order("sku").order("id");
    else if (input.sort === "published-newest") query = query.order("published_at", { ascending: false, nullsFirst: false }).order("sku").order("id");
    else if (input.sort === "published-oldest") query = query.order("published_at", { ascending: true, nullsFirst: false }).order("sku").order("id");
    else query = query.order("updated_at", { ascending: false }).order("id", { ascending: false });

    const { data, error } = await query.range(input.offset, input.offset + input.limit - 1);
    if (error) throw new Error("Products could not be read.");
    return data;
  }

  private async listByStatusPriority(
    input: Readonly<{ limit: number; offset: number; sort: ProductManagerSort }>,
    search: string,
  ): Promise<ReadonlyArray<ProductManagerListingRow>> {
    const unpublishedSegments: ReadonlyArray<ProductStatusSegment> = [
      { status: "published", publicMedia: "hidden" },
      { status: "draft", publicMedia: "any" },
      { status: "reserved", publicMedia: "any" },
      { status: "archived", publicMedia: "any" },
    ];
    const publishedSegment: ProductStatusSegment = { status: "published", publicMedia: "visible" };
    const soldSegment: ProductStatusSegment = { status: "sold", publicMedia: "any" };
    const segments = input.sort === "status-priority"
      ? [soldSegment, publishedSegment, ...unpublishedSegments]
      : [...unpublishedSegments, publishedSegment, soldSegment];

    const counts = await Promise.all(segments.map((segment) => this.countStatusSegment(segment, search)));
    let offset = input.offset;
    const pageRows: ProductManagerListingRow[] = [];

    for (let index = 0; index < segments.length && pageRows.length < input.limit; index += 1) {
      const count = counts[index];
      if (offset >= count) {
        offset -= count;
        continue;
      }

      const remaining = input.limit - pageRows.length;
      pageRows.push(...await this.readStatusSegment(segments[index], search, offset, remaining));
      offset = 0;
    }

    return pageRows;
  }

  private async countStatusSegment(segment: ProductStatusSegment, search: string): Promise<number> {
    let query = this.client.from("products").select("id", { count: "exact", head: true }).eq("status", segment.status);
    query = this.addSegmentVisibility(query, segment);
    query = this.addSearch(query, search);
    const { count, error } = await query;
    if (error || count === null) throw new Error("Product status groups could not be counted.");
    return count;
  }

  private async readStatusSegment(segment: ProductStatusSegment, search: string, offset: number, limit: number): Promise<ReadonlyArray<ProductManagerListingRow>> {
    let query = this.client.from("products").select("id, sku, title, status, price, published_at, public_media_ready_at, updated_at").eq("status", segment.status);
    query = this.addSegmentVisibility(query, segment);
    query = this.addSearch(query, search);
    const { data, error } = await query.order("updated_at", { ascending: false }).order("id", { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw new Error("Products could not be read.");
    return data;
  }

  private addSegmentVisibility<Query extends { not: (column: string, operator: string, value: string) => Query; is: (column: string, value: null) => Query }>(query: Query, segment: ProductStatusSegment): Query {
    if (segment.publicMedia === "visible") return query.not("public_media_ready_at", "is", "null");
    if (segment.publicMedia === "hidden") return query.is("public_media_ready_at", null);
    return query;
  }

  private addSearch<Query extends { or: (filters: string) => Query }>(query: Query, search: string): Query {
    if (!search) return query;
    const pattern = buildProductManagerSearchPattern(search);
    return query.or(`sku.ilike.${pattern},title.ilike.${pattern}`);
  }

  private async listPrimaryImages(rows: ReadonlyArray<ProductManagerListingRow>): Promise<ReadonlyMap<string, ProductManagerPrimaryImage>> {
    if (rows.length === 0) return new Map();
    const { data, error } = await this.client.from("product_images")
      .select("id, product_id, storage_key, alt_text, width, height")
      .in("product_id", rows.map((row) => row.id))
      .eq("position", 1);
    if (error) throw new Error("Product thumbnails could not be read.");

    const imageRows = data as ReadonlyArray<ProductManagerPrimaryImageRow>;
    const publicUrls = new Map(imageRows.flatMap((image) => {
      const product = rows.find((row) => row.id === image.product_id);
      return product?.status === "published" && product.public_media_ready_at !== null
        ? [[image.storage_key, this.storage.createPublicProductImageUrl(image.id)] as const]
        : [];
    }));
    const privateImages = imageRows.filter((image) => !publicUrls.has(image.storage_key));
    const privateUrls = new Map<string, string>();
    try {
      for (const item of await this.storage.createProductImagePreviewUrls(privateImages.map((image) => image.storage_key))) {
        privateUrls.set(item.storageKey, item.url);
      }
    } catch {
      // A missing/expired private preview degrades to the table's local placeholder.
    }

    return new Map(imageRows.flatMap((image) => {
      const url = publicUrls.get(image.storage_key) ?? privateUrls.get(image.storage_key);
      return url ? [[image.product_id, { altText: image.alt_text, height: image.height, isPublic: publicUrls.has(image.storage_key), url, width: image.width }] as const] : [];
    }));
  }

  public async save(input: SaveProductDraftInput): Promise<void> {
    const { error } = await this.client.rpc("save_product_draft", {
      p_acquisition_cost: input.acquisitionCost?.amount ?? "",
      p_audience: input.audience ?? "",
      p_brand: input.brand ?? "",
      p_color: input.color ?? "",
      p_condition_notes: input.conditionNotes ?? "",
      p_condition_rating: input.conditionRating?.toString() ?? "",
      p_description: input.description ?? "",
      p_garment_type: input.garmentType ?? "",
      p_material_details: input.materialDetails ?? "",
      p_measurements: input.measurements,
      p_price: input.price?.amount ?? "",
      p_product_id: input.id,
      p_received_at: input.receivedAt,
      p_size_label: input.sizeLabel ?? "",
      p_source_profile_id: "",
      p_source_type: input.sourceType,
      p_title: input.title.trim(),
    });

    if (error) {
      throw new Error("The Product draft could not be saved.");
    }
  }
}
