import type { ProductStatus } from "@/features/catalog/server/product.types";

export type ProductPublicationStatusPresentation = Readonly<{
  domainLabel: string | null;
  label: "No publicado" | "Publicado" | "Vendido";
  tone: "non-public" | "public" | "sold";
}>;

/** Separates customer-facing Catalog visibility from the underlying commercial lifecycle. */
export function getProductPublicationStatusPresentation(status: ProductStatus, isPubliclyVisible: boolean): ProductPublicationStatusPresentation {
  if (status === "sold") return { domainLabel: null, label: "Vendido", tone: "sold" };
  if (isPubliclyVisible) return { domainLabel: null, label: "Publicado", tone: "public" };

  const domainLabel = {
    archived: "Archivado",
    draft: null,
    published: "Preparando publicación",
    reserved: "Reservado",
    sold: null,
  }[status];

  return { domainLabel, label: "No publicado", tone: "non-public" };
}
