import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductId, ProductSlug } from "@/features/catalog/server/product.types";
import type { ProductPublicationRepository } from "@/features/product-manager/server/product-publication.repository";
import type { Database } from "@/infrastructure/supabase/database.types";

function requireSlug(value: unknown): ProductSlug { if (typeof value !== "string" || !value) throw new Error("Publication persistence returned no Product slug."); return value; }

/** Adapts only the narrow lifecycle RPCs using the caller's real admin session. */
export class SupabaseProductPublicationRepository implements ProductPublicationRepository {
  public constructor(private readonly client: SupabaseClient<Database>) {}
  public async getReadiness(productId:ProductId){const {data,error}=await this.client.rpc("get_product_publication_readiness",{p_product_id:productId});if(error||!data?.[0])throw new Error("No fue posible verificar la preparación para publicación.");return data[0].missing_requirements ?? [];}
  public async preparePublication(productId:ProductId){const {data,error}=await this.client.rpc("prepare_product_publication",{p_product_id:productId});if(error||!data?.[0])throw new Error("No fue posible preparar la publicación.");return requireSlug(data[0].slug);}
  public async completePublication(productId:ProductId){const {data,error}=await this.client.rpc("complete_product_publication",{p_product_id:productId});if(error||!data?.[0])throw new Error("No fue posible completar la publicación.");return requireSlug(data[0].slug);}
  public async beginUnpublish(productId:ProductId){const {error}=await this.client.rpc("begin_product_unpublish",{p_product_id:productId});if(error)throw new Error("No fue posible retirar el producto de la vista pública.");}
  public async completeUnpublish(productId:ProductId){const {data,error}=await this.client.rpc("complete_product_unpublish",{p_product_id:productId});if(error||!data?.[0])throw new Error("No fue posible completar el retiro de publicación.");return requireSlug(data[0].slug);}
}
