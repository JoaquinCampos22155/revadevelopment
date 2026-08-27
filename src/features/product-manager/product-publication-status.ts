import type { ProductStatus } from "@/features/catalog/server/product.types";

export type ProductPublicationStatusPresentation = Readonly<{
  domainLabel: string | null;
  label: "No publicado" | "Publicado";
  tone: "non-public" | "public";
}>;

/** Separates customer-facing Catalog visibility from the underlying commercial lifecycle. */
export function getProductPublicationStatusPresentation(status: ProductStatus, isPubliclyVisible: boolean): ProductPublicationStatusPresentation {
  if (isPubliclyVisible) return { domainLabel: null, label: "Publicado", tone: "public" };

  const domainLabel = {
    archived: "Archivado",
    draft: null,
    published: "Preparando publicación",
    reserved: "Reservado",
    sold: "Vendido",
  }[status];

  return { domainLabel, label: "No publicado", tone: "non-public" };
}
