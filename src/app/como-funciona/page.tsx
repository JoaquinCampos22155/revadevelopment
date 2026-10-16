import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import buyingEditorial from "@/assets/editorial/reva-home-clothing-rack-editorial.png";
import sellingEditorial from "@/assets/editorial/reva-home-selling-editorial.png";
import donationEditorial from "@/assets/editorial/reva-donation-garment-lot-editorial.png";
import { PageContainer } from "@/components/layout/PageContainer";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { InteractiveEcosystemMap } from "@/features/como-funciona/components/InteractiveEcosystemMap";
import { StoryJourneyPath } from "@/features/como-funciona/components/StoryJourneyPath";

export const metadata: Metadata = {
  title: "Cómo funciona REVA | Ropa de segunda mano en Guatemala",
  description: "Conoce cómo REVA conecta la compra, venta y donación de ropa de segunda mano en Guatemala.",
  alternates: { canonical: "/como-funciona" },
};

const chapters = [
  {
    id: "comprar",
    number: "01",
    label: "Descubrir",
    title: "Comprar",
    headline: "Una pieza. Una historia propia.",
    description: "Explora prendas únicas revisadas y seleccionadas por REVA. Cada ficha muestra la pieza real, sus fotografías y la condición descrita con claridad.",
    image: buyingEditorial,
    imageAlt: "Composición editorial de prendas de segunda mano en un perchero.",
    href: "/catalogo",
    link: "Explorar el catálogo",
    accent: "#3d5a66",
    detail: [
      ["¿Una prenda puede agotarse?", "Sí. Cada publicación corresponde a una sola pieza física; la disponibilidad puede cambiar."],
      ["¿El carrito la reserva?", "No. La selección del carrito se guarda en este navegador, pero no aparta inventario. REVA vuelve a confirmar disponibilidad y precio antes de continuar por WhatsApp."],
      ["¿Cómo se concreta la compra?", "Actualmente exploras el catálogo y consultas con REVA por WhatsApp. El sitio no tiene pago integrado ni una reserva automática."],
    ],
  },
  {
    id: "vender",
    number: "02",
    label: "Volver a circular",
    title: "Vender",
    headline: "Tú reúnes. REVA toma el relevo.",
    description: "Coordina un lote de 15 prendas o más. REVA lo recibe y revisa físicamente; valora las elegibles y se ocupa de fotografiarlas, publicarlas y gestionar su venta.",
    image: sellingEditorial,
    imageAlt: "Camisa preparada en un set de fotografía editorial.",
    href: "/vender",
    link: "Conocer la ruta de venta",
    accent: "#705b78",
    detail: [
      ["¿Cómo se calcula el precio?", "REVA define el precio de cada prenda considerando su condición, características y mercado; comparte un estimado antes de publicar. No existe una fórmula fija pública."],
      ["¿Cómo se distribuye una venta?", "El esquema de referencia es 65% para el propietario y 35% para REVA sobre el precio de venta. Además, se cobra una tarifa fija de Q5 por cada lote recibido, junto con el costo de envío de recepción, informado antes de coordinarlo."],
      ["¿Cuánto dura el proceso?", "El flujo operativo contempla hasta 90 días desde la recepción física del lote. Al final puedes elegir donar las piezas no vendidas o pedir que se devuelvan; el envío de regreso corre por tu cuenta. La redacción contractual final está pendiente de revisión."],
    ],
  },
  {
    id: "donar",
    number: "03",
    label: "Compartir",
    title: "Donar",
    headline: "Una decisión distinta, desde el inicio.",
    description: "Puedes reunir 15 prendas o más para donar sin intentar venderlas primero. REVA coordina la recepción, revisa y clasifica el lote según su condición y la capacidad disponible.",
    image: donationEditorial,
    imageAlt: "Prendas dobladas y reunidas en una composición editorial de tonos naturales.",
    href: "/donar",
    link: "Conocer la ruta de donación",
    accent: "#78434b",
    detail: [
      ["¿Cada prenda se entrega directamente?", "No necesariamente. Después de la revisión, algunas prendas podrían venderse para seguir circulando; otras pueden canalizarse a donación directa u otra alternativa posible. No se garantiza un destinatario específico."],
      ["¿Qué es un Drop?", "Es un espacio temporal de recolección cuando REVA lo anuncia. Fechas y lugares no son permanentes; consulta los canales oficiales para conocer una convocatoria vigente."],
      ["¿Hay reciclaje textil?", "REVA no anuncia actualmente un programa ni un socio de reciclaje activo. Las alternativas para prendas que no pueden seguir por venta o donación todavía se están definiendo."],
    ],
  },
] as const;

/** Connects the three public REVA journeys without duplicating their complete policy pages. */
export default function HowItWorksPage() {
  return (
    <main className="reva-route-transition" id="main-content">
      <StoryJourneyPath>
      <section className="overflow-hidden bg-reva-background py-14 sm:py-18 lg:py-20">
        <div className="relative z-20">
        <PageContainer>
          <header className="max-w-4xl">
            <Text className="text-reva-brand-strong" variant="label">El modelo REVA</Text>
            <Heading className="mt-4 max-w-4xl leading-[0.98] text-reva-primary sm:text-5xl lg:text-6xl" level={1} variant="editorial">Comprar, vender y donar se conectan en REVA.</Heading>
          </header>
          <InteractiveEcosystemMap />
        </PageContainer>
        </div>
      </section>

      <div className="relative overflow-hidden" id="rutas">
        <PageContainer>
          <div className="relative z-20 mx-auto max-w-6xl py-12 sm:py-16">
            <header className="mb-10 max-w-2xl sm:mb-16" data-story-heading>
              <Text className="text-reva-brand-strong" variant="label">Tres decisiones, un mismo ciclo</Text>
              <Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Sigue la ruta que tiene sentido para ti.</Heading>
            </header>
          </div>
        </PageContainer>
        <div className="relative">
          {chapters.map((chapter, index) => (
            <section className={`story-band story-band--${chapter.id}`} key={chapter.id}>
              <div className="relative z-20">
              <PageContainer>
                <article className={`story-chapter mx-auto grid max-w-6xl scroll-mt-28 items-center gap-7 py-10 sm:gap-10 sm:py-14 lg:grid-cols-2 lg:gap-20 lg:py-20 ${index === 1 ? "lg:[&>figure]:order-2" : ""}`} data-story-chapter id={chapter.id} style={{ "--story-accent": chapter.accent } as React.CSSProperties}>
            <figure className={`reva-scroll-image relative ${index === 1 ? "lg:order-2 lg:justify-self-end" : ""}`} data-story-figure>
                    <div aria-hidden="true" className="absolute -bottom-3 -right-3 h-[80%] w-[78%] border border-[var(--story-accent)]/40 sm:-bottom-5 sm:-right-5" />
                    <Image alt={chapter.imageAlt} className="relative aspect-[1.25/1] w-full object-cover shadow-[0_22px_55px_-42px_rgba(32,53,61,0.65)]" sizes="(min-width: 1024px) 42vw, 100vw" src={chapter.image} />
                  </figure>
                  <div className={`${index === 1 ? "lg:order-1" : ""} max-w-xl`} data-story-copy>
                    <div className="flex items-center gap-4">
                      <span className="font-serif text-4xl text-[var(--story-accent)]">{chapter.number}</span>
                      <span className="h-px w-12 bg-[var(--story-accent)]/60" />
                      <Text className="text-[var(--story-accent)]" variant="label">{chapter.label}</Text>
                    </div>
                    <Heading className="mt-4 text-reva-primary sm:text-5xl" level={2} variant="editorial">{chapter.title}</Heading>
                    <p className="mt-3 font-serif text-2xl leading-snug text-reva-primary sm:text-3xl">{chapter.headline}</p>
                    <Text className="mt-4 max-w-lg text-reva-secondary" variant="body">{chapter.description}</Text>
                    <div className="mt-6 divide-y divide-reva-border border-y border-reva-border">
                      {chapter.detail.map(([question, answer]) => <details className="group py-1" key={question}>
                        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-2 text-sm font-medium text-reva-primary marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2">
                          {question}<span aria-hidden="true" className="reva-disclosure-icon shrink-0 font-serif text-xl text-[var(--story-accent)]">+</span>
                        </summary>
                        <p className="max-w-lg pb-4 pr-6 text-sm leading-6 text-reva-secondary">{answer}</p>
                      </details>)}
                    </div>
                    <Link className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-reva-primary underline decoration-[var(--story-accent)] decoration-2 underline-offset-4 transition-[gap] hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-4 motion-reduce:transition-none" href={chapter.href}>{chapter.link}<span aria-hidden="true">→</span></Link>
                  </div>
                </article>
              </PageContainer>
              </div>
            </section>
          ))}
        </div>
      </div>

      <section className="bg-reva-background py-12 sm:py-16">
        <div className="relative z-20">
        <PageContainer>
          <div className="flex flex-wrap items-center justify-between gap-5 border-t border-reva-border pt-6" data-story-end>
            <Text className="text-reva-secondary" variant="body">Las condiciones actuales y los límites de cada ruta están reunidos en un solo lugar.</Text>
            <Link className="inline-flex min-h-11 items-center font-medium text-reva-brand-strong underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/terminos">Leer condiciones actuales</Link>
          </div>
        </PageContainer>
        </div>
      </section>
      </StoryJourneyPath>
    </main>
  );
}
