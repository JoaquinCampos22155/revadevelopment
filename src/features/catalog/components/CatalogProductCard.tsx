import Image from "next/image";
import Link from "next/link";

import { Text } from "@/components/ui/Text";
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
    <article className="group overflow-hidden transition duration-300 ease-out hover:-translate-y-0.5">
      <Link aria-label={`Ver ${product.name}`} className="block" href={product.href}>
        {"width" in image ? (
          <Image alt={image.alt} className="aspect-[4/5] w-full bg-reva-muted object-cover transition duration-500 ease-out group-hover:scale-[1.015]" height={image.height} src={image.src} width={image.width} />
        ) : (
          <Image alt={image.alt} className="aspect-[4/5] w-full bg-reva-muted object-cover transition duration-500 ease-out group-hover:scale-[1.015]" src={image.src} />
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
