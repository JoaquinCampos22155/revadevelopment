import type { ConditionRating } from "@/features/catalog/condition";
import type { IntakeItemId } from "@/features/intake/server/intake.types";
import type { Money } from "@/types/money";
import type { ProfileId } from "@/features/users/server/profile.types";

/** Identifies a unique selling opportunity independently from persistence. */
export type ProductId = string;

/** Identifies the sole public route for a Product. */
export type ProductSlug = string;

/** Models the approved commercial lifecycle for a unique garment. */
export type ProductStatus = "draft" | "published" | "reserved" | "sold" | "archived";

/** Keeps flexible, garment-specific dimensions separate from fixed catalog fields. */
export type ProductMeasurements = Readonly<Record<string, string>>;

/**
 * Represents a Product's internal domain state. It intentionally carries
 * operational identity and provenance that must not enter public UI contracts.
 */
export type Product = Readonly<{
  brand: string | null;
  color: string | null;
  conditionNotes: string | null;
  conditionRating: ConditionRating | null;
  createdAt: Date;
  createdByProfileId: ProfileId;
  description: string | null;
  garmentType: string | null;
  id: ProductId;
  intakeItemId: IntakeItemId;
  materialDetails: string | null;
  measurements: ProductMeasurements | null;
  price: Money | null;
  publishedAt: Date | null;
  sizeLabel: string | null;
  sku: string;
  slug: ProductSlug;
  status: ProductStatus;
  title: string;
  updatedAt: Date;
}>;

/** Represents ordered product media before a delivery provider resolves its URL. */
export type ProductImage = Readonly<{
  altText: string;
  createdAt: Date;
  height: number;
  id: string;
  mimeType: "image/avif" | "image/jpeg" | "image/png" | "image/webp";
  position: number;
  productId: ProductId;
  storageKey: string;
  width: number;
}>;

/** Supplies delivery-safe image information to presentation after ImageService resolution. */
export type ProductImageDelivery = Readonly<{
  altText: string;
  height: number;
  position: number;
  url: string;
  width: number;
}>;

/** Supplies a public catalog card without operational or storage information. */
export type PublishedProductPreview = Readonly<{
  brand: string | null;
  conditionRating: ConditionRating;
  image: ProductImageDelivery | null;
  price: Money;
  slug: ProductSlug;
  title: string;
}>;

/**
 * Supplies the public Product Detail contract. SKU, Intake provenance, creator
 * identity, and storage keys are deliberately absent.
 */
export type PublishedProduct = Readonly<{
  brand: string | null;
  color: string | null;
  conditionNotes: string | null;
  conditionRating: ConditionRating;
  description: string;
  garmentType: string;
  images: ReadonlyArray<ProductImageDelivery>;
  materialDetails: string | null;
  measurements: ProductMeasurements | null;
  price: Money;
  sizeLabel: string | null;
  slug: ProductSlug;
  title: string;
}>;
