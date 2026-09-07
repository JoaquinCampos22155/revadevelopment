"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ConditionRating } from "@/features/catalog/condition";
import { isAudience } from "@/features/catalog/audiences";
import { isColor } from "@/features/catalog/colors";
import { isGarmentType } from "@/features/catalog/garment-types";
import { isProductSize } from "@/features/catalog/sizes";
import type { IntakeSourceType } from "@/features/intake/server/intake.types";
import type { ProductMeasurements } from "@/features/catalog/server/product.types";
import { getCurrentAdminProfile } from "@/features/product-manager/server/admin-access";
import { createProductDraftActionService } from "@/features/product-manager/server/product-draft.composition";
import type { SaveProductDraftInput } from "@/features/product-manager/server/product-draft.types";
import type { ProductDraftFormState } from "@/features/product-manager/product-draft-form-state";
import type { Money } from "@/types/money";

function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function toNullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}

function toMoney(value: string): Money | null {
  const amount = value.trim();
  return amount ? { amount, currency: "GTQ" } : null;
}

function readSourceType(formData: FormData): IntakeSourceType | null {
  const value = readText(formData, "sourceType");
  return value === "sell" || value === "donate" ? value : null;
}

function readConditionRating(formData: FormData): ConditionRating | null | undefined {
  const value = readText(formData, "conditionRating");
  if (!value) return null;
  if (value === "1" || value === "2" || value === "3" || value === "4") {
    return Number(value) as ConditionRating;
  }

  return undefined;
}

function readGarmentType(formData: FormData): SaveProductDraftInput["garmentType"] | undefined {
  const value = readText(formData, "garmentType");
  if (!value) return null;

  return isGarmentType(value) ? value : undefined;
}

function readAudience(formData: FormData): SaveProductDraftInput["audience"] | undefined {
  const value = readText(formData, "audience");
  if (!value) return null;

  return isAudience(value) ? value : undefined;
}

function readColor(formData: FormData): SaveProductDraftInput["color"] | undefined {
  const value = readText(formData, "color");
  if (!value) return null;

  return isColor(value) ? value : undefined;
}

function readSizeLabel(formData: FormData): SaveProductDraftInput["sizeLabel"] | undefined {
  const value = readText(formData, "sizeLabel");
  if (!value) return null;

  return isProductSize(value) ? value : undefined;
}

function readMeasurements(formData: FormData): ProductMeasurements | null {
  const names = formData.getAll("measurementName");
  const values = formData.getAll("measurementValue");
  const measurements: Record<string, string> = {};

  for (let index = 0; index < Math.max(names.length, values.length); index += 1) {
    const rawName = names[index];
    const rawValue = values[index];
    const name = typeof rawName === "string" ? rawName.trim() : "";
    const value = typeof rawValue === "string" ? rawValue.trim() : "";

    if (!name && !value) continue;
    if (!name || !value || measurements[name]) {
      throw new Error("Measurements are incomplete.");
    }

    measurements[name] = `${value} cm`;
  }

  return Object.keys(measurements).length ? measurements : null;
}

function getDraftInput(formData: FormData): Omit<SaveProductDraftInput, "id"> | null {
  const sourceType = readSourceType(formData);
  const audience = readAudience(formData);
  const color = readColor(formData);
  const conditionRating = readConditionRating(formData);
  const garmentType = readGarmentType(formData);
  const sizeLabel = readSizeLabel(formData);

  if (
    !sourceType ||
    audience === undefined ||
    color === undefined ||
    conditionRating === undefined ||
    garmentType === undefined ||
    sizeLabel === undefined
  ) {
    return null;
  }

  return {
    acquisitionCost: sourceType === "sell" ? toMoney(readText(formData, "acquisitionCost")) : null,
    audience,
    brand: toNullableText(readText(formData, "brand")),
    color,
    conditionNotes: toNullableText(readText(formData, "conditionNotes")),
    conditionRating,
    description: toNullableText(readText(formData, "description")),
    garmentType,
    materialDetails: toNullableText(readText(formData, "materialDetails")),
    measurements: readMeasurements(formData),
    price: toMoney(readText(formData, "price")),
    receivedAt: readText(formData, "receivedAt"),
    sizeLabel,
    sourceType,
    title: readText(formData, "title"),
  };
}

function cannotSave(): ProductDraftFormState {
  return {
    error: "No fue posible guardar el borrador. Revisa los campos e inténtalo nuevamente.",
    saved: false,
  };
}

/** Creates one Intake Item and one Product draft after server-side admin verification. */
export async function createProductDraftAction(
  _previousState: ProductDraftFormState,
  formData: FormData,
): Promise<ProductDraftFormState> {
  let draftId: string;

  try {
    const admin = await getCurrentAdminProfile();
    const input = getDraftInput(formData);

    if (!admin || !input) return cannotSave();

    const service = await createProductDraftActionService();
    const draft = await service.create(input);
    draftId = draft.id;
  } catch {
    return cannotSave();
  }

  revalidatePath("/admin/productos");
  redirect(`/admin/productos/${draftId}`);
}

/** Saves an existing draft while preserving server-derived administrator identity. */
export async function saveProductDraftAction(
  _previousState: ProductDraftFormState,
  formData: FormData,
): Promise<ProductDraftFormState> {
  try {
    const admin = await getCurrentAdminProfile();
    const productId = readText(formData, "productId");
    const input = getDraftInput(formData);

    if (!admin || !productId || !input) return cannotSave();

    const service = await createProductDraftActionService();
    await service.save({ ...input, id: productId });

    revalidatePath("/admin/productos");
    revalidatePath(`/admin/productos/${productId}`);

    return { error: null, saved: true };
  } catch {
    return cannotSave();
  }
}
