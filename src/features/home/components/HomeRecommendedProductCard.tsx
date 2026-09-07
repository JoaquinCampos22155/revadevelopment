import Image from "next/image";
import Link from "next/link";

import type { CatalogProductPreview } from "@/types/catalog";

/** Keeps Home merchandising compact while reusing the approved public Product presentation contract. */
export function HomeRecommendedProductCard({ product }: Readonly<{ product: CatalogProductPreview }>) {
  const image = product.image;

  return <article className="group min-w-0"><Link aria-label={`Ver ${product.name}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-4 focus-visible:ring-offset-reva-surface" href={product.href}>{"width" in image ? <Image alt={image.alt} className="aspect-[4/5] w-full bg-reva-muted object-cover transition-transform duration-500 group-hover:scale-[1.015] motion-reduce:transition-none" height={image.height} src={image.src} width={image.width} /> : <Image alt={image.alt} className="aspect-[4/5] w-full bg-reva-muted object-cover transition-transform duration-500 group-hover:scale-[1.015] motion-reduce:transition-none" src={image.src} />}<div className="pt-3"><h3 className="font-serif text-lg leading-tight text-reva-primary">{product.name}</h3>{product.price ? <p className="mt-1 text-sm font-medium text-reva-secondary">{product.price}</p> : null}</div></Link></article>;
}
