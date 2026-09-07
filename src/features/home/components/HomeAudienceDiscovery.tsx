import Image from "next/image";
import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import type { CatalogProductPreview } from "@/types/catalog";

type AudienceCardProps = Readonly<{
  href: string;
  label: string;
  product: CatalogProductPreview | null;
  emphasis: "primary" | "secondary";
  tone: "brand" | "muted";
}>;

function AudienceCard({ emphasis, href, label, product, tone }: AudienceCardProps) {
  const image = product?.image;
  const classes = tone === "brand" ? "bg-reva-brand text-reva-surface" : "bg-reva-strong text-reva-surface";
  const layout = emphasis === "primary" ? "min-h-[25rem] sm:min-h-[31rem]" : "min-h-72 sm:min-h-80 lg:mt-14";

  return <Link aria-label={`Explorar prendas para ${label.toLowerCase()}`} className={`group relative isolate overflow-hidden p-5 shadow-[10px_12px_0_var(--reva-surface-strong)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[14px_16px_0_var(--reva-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-4 focus-visible:ring-offset-reva-background sm:p-7 ${layout} ${classes}`} href={href}>
    {image && "width" in image ? <Image alt="" className="absolute inset-0 -z-10 object-cover opacity-75 transition-transform duration-500 group-hover:scale-[1.035]" fill sizes="(min-width: 1024px) 38vw, 100vw" src={image.src} /> : null}
    {image ? <span aria-hidden className="absolute inset-0 -z-10 bg-reva-primary/45" /> : <span aria-hidden className="absolute inset-0 -z-10 surface-atmosphere" />}
    <div className="flex h-full flex-col justify-between"><Text className="text-reva-surface" variant="label">Explorar</Text><div><h3 className="font-serif text-4xl tracking-tight sm:text-5xl">{label}</h3><p className="mt-2 text-sm">Ver prendas seleccionadas <span aria-hidden>→</span></p></div></div>
  </Link>;
}

/** Keeps audience discovery within the existing safe Catalog filtering boundary. */
export function HomeAudienceDiscovery({ manProduct, womanProduct }: Readonly<{ manProduct: CatalogProductPreview | null; womanProduct: CatalogProductPreview | null }>) {
  return <section className="overflow-hidden bg-reva-background py-16 sm:py-24"><PageContainer><div className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-9"><div><Text className="text-reva-brand-strong" variant="label">Descubre a tu manera</Text><Heading className="mt-2 text-reva-primary" level={2} variant="editorial">Encuentra tu próxima pieza.</Heading></div><Link className="text-sm font-medium text-reva-action underline decoration-reva-brand/60 underline-offset-6 transition-colors hover:text-reva-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/catalogo">Ver todo el catálogo</Link></div><div className="grid gap-7 lg:grid-cols-[1.16fr_0.84fr]"><AudienceCard emphasis="primary" href="/catalogo?audiencia=mujer" label="Mujer" product={womanProduct} tone="brand" /><AudienceCard emphasis="secondary" href="/catalogo?audiencia=hombre" label="Hombre" product={manProduct} tone="muted" /></div><article className="relative mt-10 flex flex-wrap items-end justify-between gap-5 border-y border-reva-border py-6"><div aria-hidden className="absolute right-4 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full border border-reva-brand/35 sm:right-12 sm:h-24 sm:w-24" /><div><Text className="text-reva-brand-strong" variant="label">Niños</Text><Heading className="mt-1 text-reva-primary" level={3} variant="editorial">Próximamente</Heading></div><Text className="max-w-sm text-reva-secondary" variant="quiet">Cuando exista una selección disponible, podrás descubrirla aquí.</Text></article></PageContainer></section>;
}
