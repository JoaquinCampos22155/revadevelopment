"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAdminProfile } from "@/features/product-manager/server/admin-access";
import { createProductManualSaleActionRepository } from "@/features/product-manager/server/product-manual-sale.composition";
import type { ProductPublicationState } from "@/features/product-manager/product-publication-state";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function failed(): ProductPublicationState {
  return { error: "No fue posible registrar la venta. Verifica que el pago esté confirmado y que la prenda siga disponible.", success: null };
}

/** Records an Admin-attested external sale; it never creates a purchase transaction. */
export async function markProductSoldAction(_previous: ProductPublicationState, formData: FormData): Promise<ProductPublicationState> {
  try {
    if (!await getCurrentAdminProfile()) return failed();

    const productId = formData.get("productId");
    const expectedStatus = formData.get("expectedStatus");
    if (typeof productId !== "string" || !uuidPattern.test(productId)) return failed();
    if (expectedStatus !== "draft" && expectedStatus !== "published") return failed();
    if (formData.get("externalPaymentVerified") !== "verified") return failed();

    const slug = await (await createProductManualSaleActionRepository()).markSold(productId, expectedStatus);
    revalidatePath("/");
    revalidatePath("/catalogo");
    revalidatePath(`/productos/${slug}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/productos");
    revalidatePath(`/admin/productos/${productId}`);

    return { error: null, success: "La prenda se registró como vendida." };
  } catch {
    return failed();
  }
}
