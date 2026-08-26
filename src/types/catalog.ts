import type { ProductImage } from "@/types/product";

export interface CatalogCollection {
  description: string;
  title: string;
}

export interface ReviewPreview {
  author: string;
  quote: string;
  role: string;
}

export type CatalogProductPreview = Readonly<{
  category: string;
  condition: string;
  href: string;
  image: ProductImage;
  name: string;
  price: string | null;
}>;
