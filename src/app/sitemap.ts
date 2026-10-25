import type { MetadataRoute } from "next";

import { createPublicSitemap } from "@/features/catalog/catalog-seo";
import { createPublicProductService } from "@/features/catalog/server/public-product.service";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return createPublicSitemap(async () => {
    const service = await createPublicProductService();
    return service.listPublishedSlugs();
  });
}
