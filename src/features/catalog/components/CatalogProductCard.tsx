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
  return (
    <article className="group overflow-hidden rounded-2xl border border-sky-100 bg-sky-50 p-3 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/80">
      <Link aria-label={`Ver ${product.name}`} className="block" href={product.href}>
        <Image
          alt={product.image.alt}
          className="aspect-[4/5] w-full bg-sky-100 object-cover transition duration-500 ease-out group-hover:scale-[1.015]"
          src={product.image.src}
        />
        <div className="space-y-2 px-1 pb-1 pt-4">
          <div className="flex items-center justify-between gap-3">
            <Text variant="label">{product.category}</Text>
            <span className="text-xs text-slate-500">{product.condition}</span>
          </div>
          <h3 className="font-serif text-xl tracking-tight text-slate-950">{product.name}</h3>
        </div>
      </Link>
    </article>
  );
}
