import type { SupabaseClient } from "@supabase/supabase-js";

import type { ConditionRating } from "@/features/catalog/condition";
import { isAudience, type Audience } from "@/features/catalog/audiences";
import { isGarmentType, type GarmentType } from "@/features/catalog/garment-types";
import { isProductSize, type ProductSize } from "@/features/catalog/sizes";
import type { IntakeItemId, IntakeSourceType } from "@/features/intake/server/intake.types";
import type { ProductMeasurements, ProductStatus } from "@/features/catalog/server/product.types";
import type { ProductDraftRepository } from "@/features/product-manager/server/product-draft.repository";
import type { ProductManagerRepository } from "@/features/product-manager/server/product-manager.repository";
import type {
  CreatedProductDraft,
  CreateProductDraftInput,
  ProductDraft,
  ProductDraftId,
  ProductDraftSummary,
  ProductManagerProductPage,
  ProductManagerProductSummary,
  SaveProductDraftInput,
} from "@/features/product-manager/server/product-draft.types";
import type { Money } from "@/types/money";
import type { Database, Json } from "@/infrastructure/supabase/database.types";

type CreateDraftRow =
  Database["public"]["Functions"]["create_product_draft_from_intake"]["Returns"][number];
type DraftRow =
  Database["public"]["Functions"]["get_product_manager_draft"]["Returns"][number];
type DraftSummaryRow =
  Database["public"]["Functions"]["list_product_manager_drafts"]["Returns"][number];
type ProductManagerProductRow =
  Database["public"]["Functions"]["get_product_manager_product"]["Returns"][number];
type ProductManagerProductSummaryRow =
  Database["public"]["Functions"]["list_product_manager_products"]["Returns"][number];

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
  if (value === 0 || value === 1 || value === 2 || value === 3) return value;

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

function mapProductManagerProductSummary(row: ProductManagerProductSummaryRow): ProductManagerProductSummary {
  return {
    id: requireText(row.id, "Product id"),
    isPubliclyVisible: row.is_publicly_visible === true,
    price: mapMoney(row.price, "selling price"),
    publishedAt: row.published_at ? new Date(requireText(row.published_at, "publication time")) : null,
    sku: requireText(row.sku, "SKU"),
    status: mapStatus(row.status),
    title: requireText(row.title, "Product title"),
    updatedAt: new Date(requireText(row.updated_at, "update time")),
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
  public constructor(private readonly client: SupabaseClient<Database>) {}

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

  public async list(input: Readonly<{ limit: number; offset: number }>): Promise<ProductManagerProductPage> {
    const { data, error } = await this.client.rpc("list_product_manager_products", {
      p_limit: input.limit,
      p_offset: input.offset,
    });

    if (error) {
      throw new Error("Products could not be read.");
    }

    const items = data.map(mapProductManagerProductSummary);
    const hasNextPage = items.length > 25;

    return { hasNextPage, items: hasNextPage ? items.slice(0, 25) : items };
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
