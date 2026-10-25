import type { MetadataRoute } from "next";

import { createPublicRobotsRules } from "@/features/catalog/catalog-seo";

export default function robots(): MetadataRoute.Robots {
  return createPublicRobotsRules();
}
