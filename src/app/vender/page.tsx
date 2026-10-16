import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import sellingEditorial from "@/assets/editorial/reva-home-selling-editorial.png";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { getWhatsAppSellingUrl } from "@/infrastructure/config/site-contact";

export const metadata: Metadata = {
  title: "Vender ropa usada en Guatemala | REVA",
  description:
    "Reúne al menos 15 prendas y deja que REVA gestione su revisión, valoración, fotografía y venta.",
  alternates: { canonical: "/vender" },
};

const handoffSteps = [
  {
    number: "01",
    title: "Revisión física",
    text: "Recibimos el lote y revisamos cada prenda. La selección para reventa depende de su condición y características.",
  },
  {
    number: "02",
    title: "Precio y estimado",
    text: "REVA define el precio según condición, marca, características y mercado; antes de publicar, te comparte el monto estimado que te correspondería.",
  },
  {
    number: "03",
    title: "REVA toma el relevo",
    text: "Fotografiamos la prenda real, preparamos su publicación y gestionamos el proceso de venta.",
  },
] as const;

const sellerFaqs = [
  [
    "¿Qué pasa con las prendas que no se venden?",
    "Al terminar el período puedes elegir entre donarlas o recibirlas de vuelta. Si eliges la devolución, el envío corre por tu cuenta. Si no respondes, REVA contempla una notificación y un plazo adicional de 10 días; no se dispondrá de prendas no reclamadas sin tu autorización expresa previa.",
  ],
] as const;

/** Explains REVA's approved lot-based selling model without creating an Intake. */
export default function SellPage() {
  const whatsappUrl = getWhatsAppSellingUrl();

  return (
    <main className="reva-route-transition" id="main-content">
      <section className="relative overflow-x-clip bg-reva-background py-10 sm:py-14 lg:py-20">
        <PageContainer>
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div className="reva-motion-enter relative z-10 max-w-2xl">
              <Text className="text-[#705b78]" variant="label">
                Vender con REVA · Ciudad de Guatemala
              </Text>
              <Heading
                className="mt-5 max-w-xl text-reva-primary sm:text-5xl lg:text-6xl"
                level={1}
                variant="editorial"
              >
                Tu clóset cambia. <span className="text-[#705b78]">Tu ropa sigue.</span>
              </Heading>
              <Text className="mt-5 max-w-lg text-lg text-reva-secondary sm:text-xl" variant="body">
                Reúne al menos 15 prendas y coordina la entrega. REVA revisa,
                valora, fotografía y gestiona la venta de las elegibles.
              </Text>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                {whatsappUrl ? (
                  <Button className="group motion-reduce:transition-none motion-reduce:hover:translate-y-0" href={whatsappUrl} variant="solid">
                    Quiero empezar <span aria-hidden="true" className="ml-2 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">→</span>
                  </Button>
                ) : (
                  <p className="text-sm text-reva-secondary">
                    El canal para iniciar este proceso estará disponible próximamente.
                  </p>
                )}
                <span className="text-sm text-reva-secondary">15 prendas o más · un solo lote</span>
              </div>
            </div>

            <figure className="reva-scroll-image relative mx-auto w-full max-w-2xl lg:mr-0">
              <div aria-hidden="true" className="absolute -right-4 top-8 h-[78%] w-[88%] rotate-2 bg-[#d3ace0] sm:-right-7" />
              <div className="relative overflow-hidden bg-reva-muted shadow-xl">
                <Image
                  alt="Camisa de segunda mano preparada en un set de fotografía editorial."
                  className="aspect-[1.12/1] w-full object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.025] motion-reduce:transition-none motion-reduce:hover:scale-100"
                  priority
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  src={sellingEditorial}
                />
              </div>
              <figcaption className="ml-auto mt-4 max-w-[19rem] border-t border-[#705b78] pt-3 text-right font-serif text-lg leading-snug text-reva-primary">
                Segunda vida, sin gestionar cada pieza
              </figcaption>
            </figure>
          </div>
        </PageContainer>
      </section>

      <section className="bg-reva-action py-14 text-reva-on-action sm:py-20">
        <PageContainer>
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div className="max-w-md">
              <Text className="text-reva-on-action/75" variant="label">El relevo</Text>
              <Heading className="mt-3 text-reva-on-action sm:text-5xl" level={2} variant="editorial">
                Tú reúnes. REVA se encarga.
              </Heading>
              <Text className="mt-4 text-reva-on-action/80" variant="body">
                No necesitas fotografiar, publicar ni coordinar la venta de cada prenda por separado.
              </Text>
              <div className="mt-8 inline-flex items-center gap-3 border-t border-[#bdaec2]/45 pt-4">
                <span className="font-serif text-4xl">15+</span>
                <span className="max-w-[10rem] text-sm leading-5 text-reva-on-action/80">prendas para reunir en tu lote</span>
              </div>
            </div>

            <ol className="relative grid gap-7 border-l border-[#bdaec2]/50 pl-6 sm:grid-cols-3 sm:gap-5 sm:border-l-0 sm:border-t sm:pl-0 sm:pt-6">
              {handoffSteps.map((step) => (
                <li className="reva-selling-step relative" key={step.number}>
                  <span aria-hidden="true" className="absolute -left-[2.1rem] top-0 grid h-7 w-7 place-items-center rounded-full border border-[#bdaec2]/70 bg-reva-action text-xs text-[#ded5e1] sm:-top-[2.1rem] sm:left-0">
                    {step.number}
                  </span>
                  <Heading className="text-reva-on-action" level={3} variant="editorial">{step.title}</Heading>
                  <Text className="mt-3 text-sm leading-6 text-reva-on-action/75" variant="body">{step.text}</Text>
                </li>
              ))}
            </ol>
          </div>
        </PageContainer>
      </section>

      <section className="bg-[#f4eff5] py-14 sm:py-20">
        <PageContainer>
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
            <div className="relative border-l-2 border-[#705b78] pl-6 sm:pl-8">
              <Text className="text-[#705b78]" variant="label">El ciclo de venta</Text>
              <p className="mt-4 font-serif text-7xl leading-none tracking-tight text-reva-primary sm:text-8xl">90</p>
              <p className="mt-1 font-serif text-2xl text-reva-primary">días como máximo</p>
              <Text className="mt-4 max-w-sm text-reva-secondary" variant="body">
                Desde que REVA recibe físicamente el lote, intenta vender las prendas elegibles durante hasta 90 días.
              </Text>
              <div aria-hidden="true" className="mt-7 h-px w-full max-w-xs bg-reva-border">
                <div className="h-px w-3/4 bg-[#705b78]" />
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
              <article className="reva-selling-step border-t border-reva-border pt-5">
                <span className="font-serif text-3xl text-[#705b78]">01</span>
                <Heading className="mt-3 text-reva-primary" level={3} variant="editorial">Cada venta cuenta</Heading>
                <Text className="mt-3 text-reva-secondary" variant="body">
                  Por cada prenda vendida, el 65% del precio corresponde al propietario y el 35% a REVA. Tu parte corresponde después de cada venta; las condiciones y el mecanismo de pago se te informan antes de aceptar el lote.
                </Text>
                <div aria-label="Distribución del precio de venta: 65 por ciento para el propietario y 35 por ciento para REVA" className="mt-5 flex h-2 overflow-hidden rounded-full bg-white/70" role="img">
                  <span className="w-[65%] bg-[#705b78]" />
                  <span className="w-[35%] bg-reva-brand" />
                </div>
                <div className="mt-2 flex justify-between text-xs text-reva-secondary"><span>65% · Propietario</span><span>35% · REVA</span></div>
                <p className="mt-2 text-xs leading-5 text-reva-secondary">Además, se cobra Q5 por lote recibido junto con el envío de recepción a REVA. La tarifa cubre recepción, revisión, fotografía y publicación; no se devuelve por el trabajo ya realizado, sin perjuicio de los derechos aplicables.</p>
              </article>
              <article className="reva-selling-step border-t border-reva-border pt-5">
                <span className="font-serif text-3xl text-[#705b78]">02</span>
                <Heading className="mt-3 text-reva-primary" level={3} variant="editorial">Tú eliges lo que sigue</Heading>
                <Text className="mt-3 text-reva-secondary" variant="body">
                  Al terminar el período, puedes elegir donar las prendas no vendidas, recibirlas de vuelta pagando el envío o acordar una extensión. Si no respondes, REVA contempla una notificación y 10 días adicionales; disponer de prendas no reclamadas requiere tu autorización expresa previa.
                </Text>
              </article>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="bg-[#f8f5f8] py-14 sm:py-20">
        <PageContainer>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
            <div className="reva-motion-enter border-t-2 border-[#bdaec2] bg-reva-action px-6 py-8 text-reva-on-action sm:px-9 sm:py-10">
              <Text className="text-reva-on-action/75" variant="label">Antes de iniciar</Text>
              <Heading className="mt-3 text-reva-on-action" level={2} variant="editorial">Empieza con claridad.</Heading>
              <Text className="mt-4 text-reva-on-action/80" variant="body">
                La tarifa de gestión es Q5 por lote recibido y se cobra junto con el envío de recepción a REVA. Las condiciones de recepción se confirman antes de coordinar el lote.
              </Text>
              <div className="mt-7">
                {whatsappUrl ? (
                  <Button className="border border-reva-surface bg-reva-surface text-reva-primary hover:bg-reva-muted motion-reduce:transition-none motion-reduce:hover:translate-y-0" href={whatsappUrl} variant="outline">
                    Quiero vender
                  </Button>
                ) : (
                  <p className="text-sm text-reva-on-action/80">El canal para iniciar este proceso estará disponible próximamente.</p>
                )}
              </div>
            </div>
            <div>
              <Text className="text-[#705b78]" variant="label">Una última cosa</Text>
              <Heading className="mt-3 text-reva-primary" level={2} variant="editorial">¿Qué pasa al terminar?</Heading>
              <div className="mt-6 divide-y divide-reva-border border-y border-reva-border">
              {sellerFaqs.map(([question, answer]) => (
                <details className="group py-4" key={question}>
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 font-medium text-reva-primary marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-4 focus-visible:ring-offset-reva-muted">
                    {question}
                    <span aria-hidden="true" className="reva-disclosure-icon shrink-0 text-2xl text-[#705b78]">+</span>
                  </summary>
                  <p className="max-w-2xl pt-3 text-base leading-7 text-reva-secondary">{answer}</p>
                </details>
              ))}
              </div>
              <Link className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-reva-primary underline decoration-[#705b78] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/terminos">Leer las condiciones actuales de venta</Link>
            </div>
          </div>
        </PageContainer>
      </section>
    </main>
  );
}
