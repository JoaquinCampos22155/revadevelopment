import type { StaticImageData } from "next/image";

/** Keeps intrinsic metadata mandatory for runtime-delivered Product media. */
export type ProductImage =
  | Readonly<{ alt: string; src: StaticImageData }>
  | Readonly<{ alt: string; height: number; src: string; width: number }>;

export interface ProductRecommendation {
  category: string;
  image: ProductImage;
  name: string;
  slug: string;
}

export interface ProductDetail {
  brand: string;
  category: string;
  condition: string;
  description: string;
  gallery: ProductImage[];
  highlights: string[];
  name: string;
  relatedCollections: string[];
  recommendations: ProductRecommendation[];
  size: string;
  slug: string;
}
