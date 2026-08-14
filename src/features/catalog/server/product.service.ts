import type {
  ProductSlug,
  PublishedProduct,
  PublishedProductPreview,
} from "@/features/catalog/server/product.types";
import type { ProductRepository } from "@/features/catalog/server/product.repository";

/**
 * Coordinates the read-only public Product use cases currently proven by REVA.
 * The repository owns persistence; future lifecycle commands belong in a
 * separate administrative service when the Product Manager actually exists.
 */
export class ProductService {
  public constructor(private readonly productRepository: ProductRepository) {}

  public getPublishedBySlug(slug: ProductSlug): Promise<PublishedProduct | null> {
    return this.productRepository.findPublishedBySlug(slug);
  }

  public listPublished(): Promise<ReadonlyArray<PublishedProductPreview>> {
    return this.productRepository.listPublished();
  }
}
