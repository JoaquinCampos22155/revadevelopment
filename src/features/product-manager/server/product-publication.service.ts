import type { ProductId, ProductSlug } from "@/features/catalog/server/product.types";
import type { StorageService } from "@/features/catalog/server/storage.service";
import type { ProductMediaRepository } from "@/features/product-manager/server/product-media.repository";
import type { ProductPublicationRepository } from "@/features/product-manager/server/product-publication.repository";
import type { ProductPublicationReadiness, PublicationRequirement } from "@/features/product-manager/server/product-publication.types";

const allowedRequirements = new Set<PublicationRequirement>(["audience","condition","description","garment_type","image","image_order","price","private_media","sizing"]);

function mapReadiness(values: ReadonlyArray<string>): ProductPublicationReadiness {
  return { missing: values.filter((value): value is PublicationRequirement => allowedRequirements.has(value as PublicationRequirement)) };
}

/** Coordinates staged public materialization without claiming Storage/Postgres atomicity. */
export class ProductPublicationService {
  public constructor(private readonly repository:ProductPublicationRepository,private readonly mediaRepository:ProductMediaRepository,private readonly storage:StorageService) {}
  public async getReadiness(productId:ProductId):Promise<ProductPublicationReadiness>{return mapReadiness(await this.repository.getReadiness(productId));}
  public async publish(productId:ProductId):Promise<ProductSlug>{
    const readiness=await this.getReadiness(productId); if(readiness.missing.length) throw new Error("El producto todavía no está listo para publicar.");
    await this.repository.preparePublication(productId);
    const copied:string[]=[];
    try { const images=await this.mediaRepository.listByProductId(productId); for(const image of images){await this.storage.copyProductImageToPublic(image.storageKey,image.id);copied.push(image.id);} return await this.repository.completePublication(productId); }
    catch(error){
      const cleanup=await Promise.allSettled(copied.map((imageId)=>this.storage.deletePublicProductImage(imageId)));
      if(cleanup.every((result)=>result.status==="fulfilled")) await this.repository.completeUnpublish(productId);
      else console.error("Product publication cleanup requires remediation.",{productId});
      throw error;
    }
  }
  public async unpublish(productId:ProductId):Promise<ProductSlug>{
    await this.repository.beginUnpublish(productId);
    const images=await this.mediaRepository.listByProductId(productId); const removals=await Promise.allSettled(images.map((image)=>this.storage.deletePublicProductImage(image.id)));
    if(removals.some((result)=>result.status==="rejected")){console.error("Product unpublish cleanup requires remediation.",{productId});throw new Error("No fue posible retirar todas las fotos públicas.");}
    return this.repository.completeUnpublish(productId);
  }
}
