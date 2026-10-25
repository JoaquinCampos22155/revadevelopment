import type { PublishedProduct } from "@/features/catalog/server/product.types";

/** Describes only facts available from REVA's published Product projection. */
export function createProductStructuredData(product: PublishedProduct, canonicalUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((image) => image.url),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    category: product.garmentType,
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      price: product.price.amount,
      priceCurrency: product.price.currency,
      // The API projection includes only published, media-ready Products;
      // reserved and sold garments are removed from that public projection.
      availability: "https://schema.org/InStock",
    },
  };
}
