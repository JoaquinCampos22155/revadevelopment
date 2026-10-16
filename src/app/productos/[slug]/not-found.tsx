import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";

/** Avoids implying why a public Product is unavailable when the route has no published match. */
export default function ProductNotFound() {
  return (
    <main className="reva-route-transition" id="main-content">
      <Section className="text-center sm:py-32">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-reva-secondary">REVA · Catálogo</p>
        <h1 className="mt-4 font-serif text-4xl text-reva-primary sm:text-5xl">No encontramos esta prenda</h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-reva-secondary">Revisa el enlace o vuelve al catálogo para explorar las prendas publicadas.</p>
        <div className="mt-8 flex justify-center">
          <Button href="/catalogo" variant="solid">Explorar catálogo</Button>
        </div>
      </Section>
    </main>
  );
}
