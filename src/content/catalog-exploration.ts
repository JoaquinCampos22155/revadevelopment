import denimBack from "@/assets/product-denim-back.svg";
import denimDetail from "@/assets/product-denim-detail.svg";
import denimFront from "@/assets/product-denim-front.svg";
import type { ProductImage } from "@/types/product";

export type CatalogExplorationItem = Readonly<{
  category: string;
  condition: string;
  href: string;
  image: ProductImage;
  name: string;
}>;

export const explorationCategories = ["Todo", "Denim", "Básicos", "Streetwear", "Temporada"];

export const explorationProducts: CatalogExplorationItem[] = [
  { category: "Denim", condition: "Excelente estado", href: "/catalog/chaqueta-denim-clasica", image: { alt: "Chaqueta azul de silueta amplia", src: denimFront }, name: "Chaqueta denim clásica" },
  { category: "Básicos", condition: "Cuidado y revisado", href: "/catalog/sueter-azul-punto-suave", image: { alt: "Detalle de textura azul", src: denimDetail }, name: "Suéter azul de punto suave" },
  { category: "Streetwear", condition: "Excelente estado", href: "/catalog/sobrecamisa-azul-silueta-amplia", image: { alt: "Prenda azul vista posterior", src: denimBack }, name: "Sobrecamisa de silueta amplia" },
  { category: "Denim", condition: "Cuidado y revisado", href: "/catalog/camisa-denim-corte-relajado", image: { alt: "Camisa de mezclilla azul", src: denimDetail }, name: "Camisa denim relajada" },
];
