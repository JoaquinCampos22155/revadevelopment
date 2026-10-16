import { Section } from "@/components/layout/Section";

/** Reserves the PDP composition while its published Product is being read. */
export default function ProductLoading() {
  return (
    <main aria-busy="true" aria-label="Cargando producto" className="reva-pdp" id="main-content">
      <Section className="pt-8 sm:pt-12">
        <p className="sr-only" role="status">Cargando producto…</p>
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 xl:gap-16">
          <div aria-hidden="true" className="aspect-[4/5] bg-reva-muted" />
          <div aria-hidden="true" className="space-y-6 lg:pt-2">
            <div className="space-y-4 border-b border-reva-border pb-6">
              <div className="h-3 w-24 bg-reva-muted" />
              <div className="h-12 max-w-md bg-reva-muted" />
              <div className="h-20 bg-reva-muted" />
              <div className="h-8 w-28 bg-reva-muted" />
            </div>
            <div className="h-28 bg-reva-muted" />
            <div className="h-12 bg-reva-muted" />
          </div>
        </div>
      </Section>
    </main>
  );
}
