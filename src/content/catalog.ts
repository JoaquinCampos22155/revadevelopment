import denimBack from "@/assets/product-denim-back.svg";
import denimDetail from "@/assets/product-denim-detail.svg";
import denimFront from "@/assets/product-denim-front.svg";
import type { CatalogProductPreview, ReviewPreview } from "@/types/catalog";

export const catalogCategories = ["Todo", "Denim", "Básicos", "Streetwear", "Temporada"] as const;

export const catalogProducts: CatalogProductPreview[] = [
  {
    category: "Denim",
    condition: "Excelente estado",
    href: "/productos/chaqueta-denim-clasica",
    image: { alt: "Chaqueta azul de silueta amplia", src: denimFront },
    name: "Chaqueta denim clásica",
  },
  {
    category: "Básicos",
    condition: "Cuidado y revisado",
    href: "/productos/sueter-azul-punto-suave",
    image: { alt: "Detalle de textura azul", src: denimDetail },
    name: "Suéter azul de punto suave",
  },
  {
    category: "Streetwear",
    condition: "Excelente estado",
    href: "/productos/sobrecamisa-azul-silueta-amplia",
    image: { alt: "Prenda azul vista posterior", src: denimBack },
    name: "Sobrecamisa de silueta amplia",
  },
  {
    category: "Denim",
    condition: "Cuidado y revisado",
    href: "/productos/camisa-denim-corte-relajado",
    image: { alt: "Camisa de mezclilla azul", src: denimDetail },
    name: "Camisa denim relajada",
  },
];

export const catalogReviews: ReviewPreview[] = [
  {
    author: "Andrea M.",
    role: "Compradora REVA",
    quote: "La experiencia se sintió clara, cercana y mucho más cuidada de lo que esperaba.",
  },
  {
    author: "María J.",
    role: "Comunidad REVA",
    quote: "Me gusta que la moda circular se presente con intención y no como una segunda opción.",
  },
  {
    author: "Sofía R.",
    role: "Compradora REVA",
    quote: "Encontré una manera más consciente de descubrir prendas que todavía tienen mucho que contar.",
  },
];
