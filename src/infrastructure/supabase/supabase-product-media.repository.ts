import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductId } from "@/features/catalog/server/product.types";
import type { ProductMediaRepository } from "@/features/product-manager/server/product-media.repository";
import type { ProductImageRecord } from "@/features/product-manager/server/product-media.types";
import type { Database } from "@/infrastructure/supabase/database.types";

type Row = Database["public"]["Tables"]["product_images"]["Row"];
function map(row: Row): ProductImageRecord { return { altText: row.alt_text, createdAt: new Date(row.created_at), height: row.height, id: row.id, position: row.position, productId: row.product_id, storageKey: row.storage_key, width: row.width }; }

/** Adapts only session-bound Product Manager media metadata operations. */
export class SupabaseProductMediaRepository implements ProductMediaRepository {
  public constructor(private readonly client: SupabaseClient<Database>) {}
  public async listByProductId(productId: ProductId) { const {data,error}=await this.client.from("product_images").select("id, product_id, storage_key, alt_text, position, width, height, mime_type, created_at").eq("product_id",productId).order("position"); if(error) throw new Error("No fue posible leer las fotos."); return data.map(map); }
  public async findById(productId: ProductId, imageId: string) { const {data,error}=await this.client.from("product_images").select("id, product_id, storage_key, alt_text, position, width, height, mime_type, created_at").eq("id",imageId).eq("product_id",productId).maybeSingle(); if(error) throw new Error("No fue posible leer la foto."); return data?map(data):null; }
  public async createMetadata(input: Readonly<{altTextPrefix:string;height:number;id:string;productId:ProductId;storageKey:string;width:number;}>) { const {data,error}=await this.client.rpc("create_product_image_metadata",{p_alt_text_prefix:input.altTextPrefix,p_height:input.height,p_image_id:input.id,p_product_id:input.productId,p_storage_key:input.storageKey,p_width:input.width}); if(error||!data?.[0]) throw new Error("No fue posible guardar los datos de la foto."); const row=data[0]; return {altText:row.alt_text,createdAt:new Date(row.created_at),height:row.height,id:row.id,position:row.image_position,productId:row.product_id,storageKey:row.storage_key,width:row.width}; }
  public async updateAltText(productId: ProductId, imageId: string, altText: string){const {data,error}=await this.client.from("product_images").update({alt_text:altText}).eq("id",imageId).eq("product_id",productId).select("id");if(error || data.length !== 1)throw new Error("No fue posible actualizar la descripción de la foto.");}
  public async reorder(productId:ProductId,imageIds:ReadonlyArray<string>){const {error}=await this.client.rpc("reorder_product_images",{p_ordered_image_ids:[...imageIds],p_product_id:productId});if(error)throw new Error("No fue posible cambiar el orden de las fotos.");}
  public async deleteMetadata(productId: ProductId, imageId: string){const {data,error}=await this.client.rpc("delete_product_image_metadata",{p_product_image_id:imageId});if(error || data?.[0]?.product_id !== productId)throw new Error("La foto se eliminó del almacenamiento, pero falta retirar sus datos. Intenta nuevamente.");}
}
