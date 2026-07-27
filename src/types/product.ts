import type { StaticImageData } from "next/image";

export interface ProductImage {
  alt: string;
  src: StaticImageData;
}

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
