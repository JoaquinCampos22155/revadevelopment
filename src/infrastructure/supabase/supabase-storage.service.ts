import type { SupabaseClient } from "@supabase/supabase-js";
import type { StorageService } from "@/features/catalog/server/storage.service";
import type { Database } from "@/infrastructure/supabase/database.types";
const bucket = "product-media";
const publicBucket = "public-product-media";

function publicKey(imageId: string): string { return `products/${imageId}.webp`; }
/** Resolves Product media through the caller's RLS-bound Supabase Storage context. */
export class SupabaseStorageService implements StorageService {
  public constructor(private readonly client: SupabaseClient<Database>) {}
  public async copyProductImageToPublic(storageKey:string,imageId:string){const {error}=await this.client.storage.from(bucket).copy(storageKey,publicKey(imageId),{destinationBucket:publicBucket});if(error)throw new Error("No fue posible preparar la foto para publicación.");}
  public async uploadProductImage(input: Readonly<{bytes:Uint8Array;storageKey:string}>){const {error}=await this.client.storage.from(bucket).upload(input.storageKey,input.bytes,{cacheControl:"31536000",contentType:"image/webp",upsert:false});if(error)throw new Error("No fue posible cargar la foto optimizada.");}
  public createPublicProductImageUrl(imageId:string){return this.client.storage.from(publicBucket).getPublicUrl(publicKey(imageId)).data.publicUrl;}
  public async deletePublicProductImage(imageId:string){const {error}=await this.client.storage.from(publicBucket).remove([publicKey(imageId)]);if(error)throw new Error("No fue posible retirar la foto pública.");}
  public async deleteProductImage(storageKey:string){const {error}=await this.client.storage.from(bucket).remove([storageKey]);if(error)throw new Error("No fue posible eliminar la foto del almacenamiento.");}
  public async hasPublicProductImage(imageId:string){const {data,error}=await this.client.storage.from(publicBucket).list("products",{search:`${imageId}.webp`});if(error)throw new Error("No fue posible verificar la foto pública.");return data.some((object)=>object.name===`${imageId}.webp`);}
  public async createProductImagePreviewUrl(storageKey:string){const {data,error}=await this.client.storage.from(bucket).createSignedUrl(storageKey,300);if(error||!data?.signedUrl)throw new Error("No fue posible preparar la vista previa.");return data.signedUrl;}
}
