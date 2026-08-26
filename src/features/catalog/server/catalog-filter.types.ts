import type { Audience } from "@/features/catalog/audiences";
import type { Color } from "@/features/catalog/colors";
import type { ConditionRating } from "@/features/catalog/condition";
import type { GarmentType } from "@/features/catalog/garment-types";
import type { ProductSize } from "@/features/catalog/sizes";

import type { PublishedProductPreview } from "@/features/catalog/server/product.types";

/** Contains only validated business filters, never URL or PostgREST syntax. */
export type PublishedCatalogFilters = Readonly<{
  audiences: ReadonlyArray<Audience>;
  brands: ReadonlyArray<string>;
  colors: ReadonlyArray<Color>;
  conditionRatings: ReadonlyArray<ConditionRating>;
  garmentTypes: ReadonlyArray<GarmentType>;
  maxPriceCents: string | null;
  minPriceCents: string | null;
  sizes: ReadonlyArray<ProductSize>;
}>;

/** Keeps offset pagination available without coupling it to the present UI. */
export type PublishedCatalogQuery = Readonly<{
  filters: PublishedCatalogFilters;
  page: number;
  pageSize: number;
}>;

/** Lists global, published-only values that may appear in the MVP filter UI. */
export type PublishedCatalogFacets = Readonly<{
  audiences: ReadonlyArray<Audience>;
  brands: ReadonlyArray<string>;
  colors: ReadonlyArray<Color>;
  conditionRatings: ReadonlyArray<ConditionRating>;
  garmentTypes: ReadonlyArray<GarmentType>;
  sizes: ReadonlyArray<ProductSize>;
}>;

export type PublishedCatalogPage = Readonly<{
  items: ReadonlyArray<PublishedProductPreview>;
  page: number;
  pageSize: number;
  total: number;
}>;
