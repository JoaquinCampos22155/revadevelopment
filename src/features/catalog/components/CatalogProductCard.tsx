import Image from "next/image";
import Link from "next/link";

import { Text } from "@/components/ui/Text";
import { catalogProductImageSizes } from "@/features/catalog/catalog-product-image-sizing";
import type { CatalogProductPreview } from "@/types/catalog";

type CatalogProductCardProps = Readonly<{
  product: CatalogProductPreview;
}>;

/**
 * Presents a catalog product preview with the trust facts needed before a visitor opens its detail page.
 * It deliberately stays data-agnostic so future catalog data can replace editorial content without redesigning the card.
 */
export function CatalogProductCard({ product }: CatalogProductCardProps) {
  const image = product.image;

  return (
    <article className="reva-product-tile group overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link aria-label={`Ver ${product.name}`} className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-4 focus-visible:ring-offset-reva-background" href={product.href}>
        {"width" in image ? (
          <Image alt={image.alt} className="aspect-[4/5] w-full bg-reva-muted object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015] group-focus-visible:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100" height={image.height} sizes={catalogProductImageSizes} src={image.src} width={image.width} />
        ) : (
          <Image alt={image.alt} className="aspect-[4/5] w-full bg-reva-muted object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015] group-focus-visible:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100" sizes={catalogProductImageSizes} src={image.src} />
        )}
        <div className="space-y-2 pb-1 pt-3">
          <div className="flex items-center justify-between gap-3">
            <Text className="text-reva-brand-strong" variant="label">{product.category}</Text>
            <span className="text-xs text-reva-secondary">{product.condition}</span>
          </div>
          <h3 className="font-serif text-xl tracking-tight text-reva-primary">{product.name}</h3>
          {product.price ? <p className="text-sm font-medium text-reva-brand-strong">{product.price}</p> : null}
        </div>
      </Link>
    </article>
  );
}
