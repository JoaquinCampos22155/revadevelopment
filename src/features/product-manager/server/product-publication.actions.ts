"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdminProfile } from "@/features/product-manager/server/admin-access";
import { createProductPublicationActionService } from "@/features/product-manager/server/product-publication.composition";
import type { ProductPublicationState } from "@/features/product-manager/product-publication-state";

function failed():ProductPublicationState{return {error:"No fue posible completar la transición de publicación.",success:null};}

/** Performs the approved lifecycle actions after repeated server-side admin verification. */
export async function publishProductAction(_previous:ProductPublicationState,formData:FormData):Promise<ProductPublicationState>{
  try { if(!await getCurrentAdminProfile()) return failed(); const productId=formData.get("productId");if(typeof productId!=="string"||!productId)return failed();const slug=await (await createProductPublicationActionService()).publish(productId);revalidatePath("/catalogo");revalidatePath(`/productos/${slug}`);revalidatePath(`/admin/productos/${productId}`);return {error:null,success:"Producto publicado."}; } catch { return failed(); }
}

export async function unpublishProductAction(_previous:ProductPublicationState,formData:FormData):Promise<ProductPublicationState>{
  try { if(!await getCurrentAdminProfile()) return failed(); const productId=formData.get("productId");if(typeof productId!=="string"||!productId)return failed();const slug=await (await createProductPublicationActionService()).unpublish(productId);revalidatePath("/catalogo");revalidatePath(`/productos/${slug}`);revalidatePath(`/admin/productos/${productId}`);return {error:null,success:"Producto retirado de publicación."}; } catch { return failed(); }
}
