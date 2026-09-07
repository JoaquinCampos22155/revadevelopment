import Image from "next/image";
import Link from "next/link";

import donationEditorial from "@/assets/editorial/reva-home-donation-editorial.png";
import sellingEditorial from "@/assets/editorial/reva-home-selling-editorial.png";
import { PageContainer } from "@/components/layout/PageContainer";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

/** Visually separates REVA's human participation journeys from garment discovery. */
export function HomeParticipationSection() {
  return <section className="relative overflow-hidden bg-reva-brand py-16 text-reva-on-brand sm:py-24">
    <div aria-hidden className="absolute -right-20 top-10 h-64 w-64 rounded-full border-[18px] border-reva-on-brand/20 sm:h-96 sm:w-96" />
    <PageContainer>
      <div className="relative">
        <div className="mb-8 max-w-xl sm:mb-10">
          <Text className="text-reva-on-brand" variant="label">Participa en REVA</Text>
          <Heading className="mt-2 text-reva-on-brand" level={2} variant="editorial">Tus prendas pueden seguir circulando.</Heading>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
          <Link className="group relative grid min-h-[25rem] overflow-hidden border border-reva-on-brand/30 bg-reva-primary/15 p-5 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-surface focus-visible:ring-offset-4 focus-visible:ring-offset-reva-brand sm:p-7" href="/vender">
            <Image alt="" className="absolute inset-0 z-0 object-cover object-[62%_center] opacity-75 transition-transform duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transition-none" fill sizes="(min-width: 1024px) 56vw, 100vw" src={sellingEditorial} />
            <span aria-hidden className="absolute inset-0 z-10 bg-reva-primary/50" />
            <div className="relative z-20 self-end">
              <Text className="text-reva-surface" variant="label">Vender</Text>
              <h3 className="mt-2 max-w-sm font-serif text-3xl tracking-tight text-reva-surface">Conoce cómo ofrecer tus prendas.</h3>
              <p className="mt-3 text-sm text-reva-surface">Ver el proceso <span aria-hidden>→</span></p>
            </div>
          </Link>
          <Link className="group relative flex min-h-[19rem] flex-col justify-between overflow-hidden border border-reva-on-brand/35 bg-reva-surface p-6 text-reva-primary shadow-[12px_14px_0_color-mix(in_srgb,var(--reva-primary)_32%,transparent)] transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-surface focus-visible:ring-offset-4 focus-visible:ring-offset-reva-brand sm:p-8" href="/donar">
            <Image alt="" className="absolute inset-0 z-0 object-cover object-[55%_center] opacity-60 transition-transform duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transition-none" fill sizes="(min-width: 1024px) 38vw, 100vw" src={donationEditorial} />
            <span aria-hidden className="absolute inset-0 z-10 bg-reva-surface/60" />
            <div aria-hidden className="absolute -right-9 -top-9 z-10 h-44 w-44 rounded-full border-[16px] border-reva-muted transition-transform duration-500 group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:transition-none" />
            <Text className="relative z-20 text-reva-brand-strong" variant="label">Donar</Text>
            <div className="relative z-20">
              <h3 className="max-w-xs font-serif text-3xl tracking-tight">Dale a una prenda otra oportunidad.</h3>
              <p className="mt-4 text-sm text-reva-secondary">Conoce esta ruta <span aria-hidden>→</span></p>
            </div>
          </Link>
        </div>
      </div>
    </PageContainer>
  </section>;
}
