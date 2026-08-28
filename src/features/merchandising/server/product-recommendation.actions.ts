"use server";

import { revalidatePath } from "next/cache";

import type { ProductRecommendationActionState } from "@/features/merchandising/product-recommendation-state";
import { getCurrentAdminProfile } from "@/features/product-manager/server/admin-access";
import { createProductRecommendationActionService } from "@/features/merchandising/server/product-recommendation.composition";

function failed(): ProductRecommendationActionState {
  return { error: "No fue posible actualizar Recomendado por REVA.", success: null };
}

function readProductId(formData: FormData): string | null {
  const value = formData.get("productId");
  return typeof value === "string" && value ? value : null;
}

function refresh(productId: string): void {
  revalidatePath("/");
  revalidatePath("/admin/productos/recomendados");
  revalidatePath(`/admin/productos/${productId}`);
}

/** Adds a currently public Product to the end of the explicit editorial order. */
export async function addProductRecommendationAction(
  _previous: ProductRecommendationActionState,
  formData: FormData,
): Promise<ProductRecommendationActionState> {
  try {
    if (!await getCurrentAdminProfile()) return failed();
    const productId = readProductId(formData);
    if (!productId) return failed();
    await (await createProductRecommendationActionService()).add(productId);
    refresh(productId);
    return { error: null, success: "Producto agregado a Recomendado por REVA." };
  } catch {
    return failed();
  }
}

/** Removes a Product and lets PostgreSQL compact the remaining editorial positions. */
export async function removeProductRecommendationAction(
  _previous: ProductRecommendationActionState,
  formData: FormData,
): Promise<ProductRecommendationActionState> {
  try {
    if (!await getCurrentAdminProfile()) return failed();
    const productId = readProductId(formData);
    if (!productId) return failed();
    await (await createProductRecommendationActionService()).remove(productId);
    refresh(productId);
    return { error: null, success: "Producto retirado de Recomendado por REVA." };
  } catch {
    return failed();
  }
}

/** Moves one existing recommendation by submitting the complete validated set to PostgreSQL. */
export async function moveProductRecommendationAction(
  _previous: ProductRecommendationActionState,
  formData: FormData,
): Promise<ProductRecommendationActionState> {
  try {
    if (!await getCurrentAdminProfile()) return failed();
    const productId = readProductId(formData);
    const direction = formData.get("direction");
    if (!productId || (direction !== "up" && direction !== "down")) return failed();

    const service = await createProductRecommendationActionService();
    const recommendations = [...await service.list()];
    const currentIndex = recommendations.findIndex((recommendation) => recommendation.productId === productId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= recommendations.length) return failed();

    [recommendations[currentIndex], recommendations[targetIndex]] = [recommendations[targetIndex], recommendations[currentIndex]];
    await service.reorder(recommendations.map((recommendation) => recommendation.productId));
    refresh(productId);
    return { error: null, success: "Orden actualizado." };
  } catch {
    return failed();
  }
}
