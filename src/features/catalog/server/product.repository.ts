import type {
  ProductSlug,
  PublishedProduct,
} from "@/features/catalog/server/product.types";
import type { PublishedCatalogFacets, PublishedCatalogPage, PublishedCatalogQuery } from "@/features/catalog/server/catalog-filter.types";

/**
 * Defines only the published Product persistence boundary currently required.
 * Future admin writes will receive a separate repository once a real management
 * use case exists, so public reads cannot accidentally inherit write authority.
 */
export interface ProductRepository {
  findPublishedBySlug(slug: ProductSlug): Promise<PublishedProduct | null>;
  listPublished(query: PublishedCatalogQuery): Promise<PublishedCatalogPage>;
  listPublishedFacets(): Promise<PublishedCatalogFacets>;
}
