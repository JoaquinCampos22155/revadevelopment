import type { SupabaseClient } from "@supabase/supabase-js";
import type { StorageService } from "@/features/catalog/server/storage.service";
import type { Database } from "@/infrastructure/supabase/database.types";
const bucket = "product-media";
/** Resolves Product media through the caller's RLS-bound Supabase Storage context. */
export class SupabaseStorageService implements StorageService {
  public constructor(private readonly client: SupabaseClient<Database>) {}
  public async uploadProductImage(input: Readonly<{bytes:Uint8Array;storageKey:string}>){const {error}=await this.client.storage.from(bucket).upload(input.storageKey,input.bytes,{cacheControl:"31536000",contentType:"image/webp",upsert:false});if(error)throw new Error("No fue posible cargar la foto optimizada.");}
  public async deleteProductImage(storageKey:string){const {error}=await this.client.storage.from(bucket).remove([storageKey]);if(error)throw new Error("No fue posible eliminar la foto del almacenamiento.");}
  public async createProductImagePreviewUrl(storageKey:string){const {data,error}=await this.client.storage.from(bucket).createSignedUrl(storageKey,300);if(error||!data?.signedUrl)throw new Error("No fue posible preparar la vista previa.");return data.signedUrl;}
}
