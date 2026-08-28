import Image from "next/image";
import Link from "next/link";

import type { CatalogProductPreview } from "@/types/catalog";

/** Keeps Home merchandising compact while reusing the approved public Product presentation contract. */
export function HomeRecommendedProductCard({ product }: Readonly<{ product: CatalogProductPreview }>) {
  const image = product.image;

  return <article className="group min-w-0"><Link aria-label={`Ver ${product.name}`} className="block" href={product.href}>{"width" in image ? <Image alt={image.alt} className="aspect-[4/5] w-full bg-sky-50 object-cover transition duration-500 group-hover:scale-[1.01]" height={image.height} src={image.src} width={image.width} /> : <Image alt={image.alt} className="aspect-[4/5] w-full bg-sky-50 object-cover transition duration-500 group-hover:scale-[1.01]" src={image.src} />}<div className="pt-3"><h3 className="font-serif text-lg leading-tight text-slate-950">{product.name}</h3>{product.price ? <p className="mt-1 text-sm font-medium text-slate-700">{product.price}</p> : null}</div></Link></article>;
}
