import denimBack from "@/assets/product-denim-back.svg";
import denimDetail from "@/assets/product-denim-detail.svg";
import denimFront from "@/assets/product-denim-front.svg";
import type { ProductDetail, ProductRecommendation } from "@/types/product";

const editorialRecommendations: ProductRecommendation[] = [
  {
    category: "Denim",
    image: { alt: "Camisa de mezclilla en tono azul claro", src: denimDetail },
    name: "Camisa denim de corte relajado",
    slug: "camisa-denim-corte-relajado",
  },
  {
    category: "Básicos",
    image: { alt: "Suéter azul de textura suave", src: denimBack },
    name: "Suéter azul de punto suave",
    slug: "sueter-azul-punto-suave",
  },
  {
    category: "Streetwear",
    image: { alt: "Chaqueta azul de silueta amplia", src: denimFront },
    name: "Sobrecamisa azul de silueta amplia",
    slug: "sobrecamisa-azul-silueta-amplia",
  },
];

export const productDetails: ProductDetail[] = [
  {
    brand: "REVA Selection",
    category: "Denim",
    condition: "Excelente estado",
    description:
      "Una chaqueta de mezclilla con estructura suave y un tono azul fácil de combinar. Su carácter está en los detalles: costuras visibles, una silueta cómoda y una historia lista para continuar.",
    gallery: [
      { alt: "Vista frontal de chaqueta de mezclilla azul", src: denimFront },
      { alt: "Detalle de la textura de mezclilla azul", src: denimDetail },
      { alt: "Vista posterior de chaqueta de mezclilla azul", src: denimBack },
    ],
    highlights: [
      "Mezclilla de tono azul medio",
      "Silueta cómoda para capas ligeras",
      "Detalles revisados por la selección REVA",
    ],
    name: "Chaqueta denim clásica",
    relatedCollections: ["Vintage Denim", "Street Essentials"],
    recommendations: editorialRecommendations,
    size: "M",
    slug: "chaqueta-denim-clasica",
  },
  ...editorialRecommendations.map((recommendation) => ({
    brand: "REVA Selection",
    category: recommendation.category,
    condition: "Excelente estado",
    description:
      "Una selección editorial de REVA pensada para demostrar cómo cada ficha contará la historia, el cuidado y el potencial de una prenda que sigue circulando.",
    gallery: [recommendation.image, { alt: "Detalle editorial de la prenda", src: denimDetail }],
    highlights: [
      "Selección editorial REVA",
      "Información clara antes de contactar",
      "Una pieza pensada para seguir circulando",
    ],
    name: recommendation.name,
    relatedCollections: ["REVA Favorites", "Street Essentials"],
    recommendations: editorialRecommendations.filter(
      (otherRecommendation) => otherRecommendation.slug !== recommendation.slug,
    ),
    size: "M",
    slug: recommendation.slug,
  })),
];

/** Finds static product content until the catalog is connected to its future data source. */
export function findProductBySlug(slug: string) {
  return productDetails.find((product) => product.slug === slug);
}
