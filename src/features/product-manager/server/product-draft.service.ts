import type { ConditionRating } from "@/features/catalog/condition";
import { isAudience } from "@/features/catalog/audiences";
import { isColor } from "@/features/catalog/colors";
import { isGarmentType } from "@/features/catalog/garment-types";
import { isProductSize } from "@/features/catalog/sizes";
import type { IntakeSourceType } from "@/features/intake/server/intake.types";
import type { ProductMeasurements } from "@/features/catalog/server/product.types";
import type { ProductDraftRepository } from "@/features/product-manager/server/product-draft.repository";
import type {
  CreatedProductDraft,
  CreateProductDraftInput,
  ProductDraft,
  ProductDraftId,
  ProductDraftSummary,
  SaveProductDraftInput,
} from "@/features/product-manager/server/product-draft.types";
import type { Money } from "@/types/money";

const decimalPattern = /^\d+(?:\.\d{1,2})?$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function toCanonicalDecimal(value: string, field: string): string {
  const trimmed = value.trim();

  if (!decimalPattern.test(trimmed)) {
    throw new Error(`${field} must be a positive GTQ amount with up to two decimals.`);
  }

  const [whole, fraction = ""] = trimmed.split(".");
  const canonical = `${whole}.${fraction.padEnd(2, "0")}`;

  if (`${whole}${fraction.padEnd(2, "0")}`.replace(/^0+/, "") === "") {
    throw new Error(`${field} must be greater than zero.`);
  }

  return canonical;
}

function assertReceiptDate(value: string): void {
  if (!datePattern.test(value)) {
    throw new Error("Receipt date must be a valid calendar date.");
  }
}

function assertSourceType(value: IntakeSourceType): void {
  if (value !== "sell" && value !== "donate") {
    throw new Error("Source type is invalid.");
  }
}

function assertTitle(value: string): void {
  if (!value.trim()) {
    throw new Error("Product title is required.");
  }
}

function assertConditionRating(value: ConditionRating | null): void {
  if (value !== null && value !== 1 && value !== 2 && value !== 3 && value !== 4) {
    throw new Error("Condition rating is invalid.");
  }
}

function assertGarmentType(value: string | null): void {
  if (value !== null && !isGarmentType(value)) {
    throw new Error("Garment type is not approved.");
  }
}

function assertAudience(value: string | null): void {
  if (value !== null && !isAudience(value)) {
    throw new Error("Product audience is not approved.");
  }
}

function assertColor(value: string | null): void {
  if (value !== null && !isColor(value)) {
    throw new Error("Product color is not approved.");
  }
}

function assertSizeLabel(value: string | null): void {
  if (value !== null && !isProductSize(value)) {
    throw new Error("Product size is not approved.");
  }
}

function assertMeasurements(value: ProductMeasurements | null): void {
  if (!value) return;

  for (const [name, measurement] of Object.entries(value)) {
    if (!name.trim() || !/^\d+(?:\.\d{1,2})? cm$/.test(measurement)) {
      throw new Error("Measurements must have a name and a positive value in centimeters.");
    }
  }
}

function normalizeSlug(title: string): string {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) {
    throw new Error("Product title cannot produce a valid URL slug.");
  }

  return slug;
}

function assertAcquisitionCost(sourceType: IntakeSourceType, value: Money | null): void {
  if (sourceType === "donate" && value !== null) {
    throw new Error("Donated garments cannot have an acquisition cost.");
  }

  if (sourceType === "sell" && value === null) {
    throw new Error("Purchased garments require an acquisition cost.");
  }

  if (value) {
    toCanonicalDecimal(value.amount, "Acquisition cost");
  }
}

function assertMoney(value: Money | null, field: string): void {
  if (value) {
    toCanonicalDecimal(value.amount, field);
  }
}

function normalizeMoney(value: Money | null, field: string): Money | null {
  return value
    ? { amount: toCanonicalDecimal(value.amount, field), currency: "GTQ" }
    : null;
}

function assertDraftInput(input: Omit<SaveProductDraftInput, "id">): void {
  assertSourceType(input.sourceType);
  assertReceiptDate(input.receivedAt);
  assertTitle(input.title);
  assertAcquisitionCost(input.sourceType, input.acquisitionCost);
  assertAudience(input.audience);
  assertColor(input.color);
  assertGarmentType(input.garmentType);
  assertSizeLabel(input.sizeLabel);
  assertMoney(input.price, "Selling price");
  assertConditionRating(input.conditionRating);
  assertMeasurements(input.measurements);
}

/**
 * Owns Product Manager's draft rules: input validity, slug derivation, and the
 * Intake/Product lifecycle boundary. Persistence remains in its repository.
 */
export class ProductDraftService {
  public constructor(private readonly productDraftRepository: ProductDraftRepository) {}

  public async create(input: CreateProductDraftInput): Promise<CreatedProductDraft> {
    assertDraftInput(input);

    return this.productDraftRepository.createFromIntake({
      ...input,
      acquisitionCost: normalizeMoney(input.acquisitionCost, "Acquisition cost"),
      price: normalizeMoney(input.price, "Selling price"),
      slug: normalizeSlug(input.title),
    });
  }

  public findDraftById(id: ProductDraftId): Promise<ProductDraft | null> {
    return this.productDraftRepository.findDraftById(id);
  }

  public listDrafts(): Promise<ReadonlyArray<ProductDraftSummary>> {
    return this.productDraftRepository.listDrafts();
  }

  public async save(input: SaveProductDraftInput): Promise<void> {
    assertDraftInput(input);

    await this.productDraftRepository.save({
      ...input,
      acquisitionCost: normalizeMoney(input.acquisitionCost, "Acquisition cost"),
      price: normalizeMoney(input.price, "Selling price"),
    });
  }
}
