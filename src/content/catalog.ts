import type { CatalogCollection, ReviewPreview } from "@/types/catalog";

export const catalogCategories = ["Denim", "Básicos", "Streetwear", "Temporada"];

export const catalogCollections: CatalogCollection[] = [
  {
    title: "Vintage Denim",
    description: "Denim con carácter y una historia que puede continuar.",
  },
  {
    title: "Street Essentials",
    description: "Piezas cotidianas pensadas para moverse contigo.",
  },
  {
    title: "Campus Basics",
    description: "Estilo versátil para el ritmo universitario.",
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
