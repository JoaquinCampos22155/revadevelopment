import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import donationGarmentLot from "@/assets/editorial/reva-donation-garment-lot-editorial.png";
import donationEditorial from "@/assets/editorial/reva-home-donation-editorial.png";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Donar ropa en Guatemala | REVA",
  description:
    "Conoce cómo donar desde el inicio un lote de al menos 15 prendas con REVA.",
  alternates: { canonical: "/donar" },
};

const donationJourney = [
  {
    number: "01",
    title: "Elige donar",
    description:
      "Es un camino distinto desde el inicio; no necesitas intentar vender primero.",
  },
  {
    number: "02",
    title: "Reúne 15 prendas o más",
    description:
      "Junta en un solo lote ropa que ya no uses y que quieras donar.",
  },
  {
    number: "03",
    title: "Coordina con REVA",
    description:
      "Antes de avanzar, coordinamos cómo recibir el lote. El canal de contacto aún está pendiente.",
  },
  {
    number: "04",
    title: "REVA recibe y revisa",
    description:
      "La revisión física permite conocer las prendas y definir qué alternativas son posibles.",
  },
  {
    number: "05",
    title: "Se reúne una oportunidad",
    description:
      "REVA acumula las prendas hasta contar con volumen suficiente o una oportunidad apropiada para coordinar una entrega.",
  },
] as const;

/** Explains donation as a distinct REVA journey without promising an outcome. */
export default function DonatePage() {
  return (
    <main className="reva-route-transition" id="main-content">
      <section className="overflow-hidden bg-[#f4eee4] py-12 sm:py-16 lg:py-20">
        <PageContainer>
          <div className="grid items-center gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
            <div className="reva-motion-enter relative z-10 max-w-xl">
              <Text className="text-[#78434b]" variant="label">
                Donar con REVA
              </Text>
              <Heading
                className="mt-4 leading-[0.98] text-reva-primary sm:text-5xl lg:text-6xl"
                level={1}
                variant="editorial"
              >
                Una segunda vida empieza con una decisión.
              </Heading>
              <Text className="mt-5 max-w-lg text-lg text-reva-secondary sm:text-xl" variant="body">
                Si quieres donar, puedes elegirlo desde el inicio. No tienes que
                intentar vender tus prendas primero.
              </Text>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button href="#recorrido" variant="solid">
                  Conoce el recorrido <span aria-hidden="true" className="ml-2">↓</span>
                </Button>
                <p className="font-serif text-2xl text-[#78434b]">
                  15 <span className="font-sans text-sm">prendas o más</span>
                </p>
              </div>
            </div>

            <figure className="reva-scroll-image relative mx-auto w-full max-w-2xl lg:justify-self-end">
              <div
                aria-hidden="true"
                className="absolute -bottom-4 -left-4 h-[82%] w-[84%] border border-[#78434b]/35 sm:-bottom-6 sm:-left-6"
              />
              <Image
                alt="Prendas dobladas y colgadas en una composición editorial de tonos naturales."
                className="relative aspect-[1.12/1] w-full object-cover object-center"
                priority
                sizes="(min-width: 1024px) 56vw, 100vw"
                src={donationEditorial}
              />
            </figure>
          </div>
        </PageContainer>
      </section>

      <section className="bg-[#f8f6f2] py-16 sm:py-20 lg:py-24" id="recorrido">
        <PageContainer>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20">
            <div className="lg:sticky lg:top-28">
              <Text className="text-[#78434b]" variant="label">
                Un camino claro
              </Text>
              <Heading className="mt-3 max-w-md text-reva-primary" level={2} variant="editorial">
                De tu clóset a una oportunidad compartida.
              </Heading>
              <figure className="reva-scroll-image relative mt-9 max-w-md">
                <div
                  aria-hidden="true"
                  className="absolute -bottom-3 -right-3 h-[72%] w-[78%] border border-[#78434b]/30"
                />
                <Image
                  alt="Lote editorial de prendas dobladas y reunidas."
                  className="relative aspect-[5/4] w-full object-cover object-center"
                  sizes="(min-width: 1024px) 32vw, 90vw"
                  src={donationGarmentLot}
                />
              </figure>
            </div>

            <div className="space-y-8">
              <ol className="relative border-l border-[#78434b]/55 pl-7 sm:pl-10">
              {donationJourney.map((step, index) => (
                <li
                  className={`reva-donation-step relative ${index === donationJourney.length - 1 ? "pb-0" : "pb-14 sm:pb-16"}`}
                  key={step.number}
                >
                  <span
                    aria-hidden="true"
                    className="absolute -left-11 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-[#78434b]/55 bg-reva-muted font-serif text-xs text-[#78434b] sm:-left-14"
                  >
                    {step.number}
                  </span>
                  <Heading className="text-reva-primary" level={3} variant="editorial">
                    {step.title}
                  </Heading>
                  <Text className="mt-2 max-w-xl text-reva-secondary" variant="body">
                    {step.description}
                  </Text>
                </li>
              ))}
              </ol>
              <aside className="border-l-2 border-[#78434b] bg-[#f4eee4] px-5 py-5 sm:px-7">
              <Text className="text-[#78434b]" variant="label">Una nota importante sobre el destino</Text>
              <Text className="mt-2 text-reva-primary" variant="body">
                Donar a REVA no significa que cada prenda se entregue directamente a una persona u organización. Después de revisarlas y clasificarlas, algunas pueden destinarse a venta para seguir circulando; otras pueden continuar por donación directa cuando la condición y la capacidad lo permitan. REVA no garantiza un destinatario específico.
              </Text>
              <Link className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-reva-primary underline decoration-[#78434b] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/terminos">Leer las condiciones actuales de donación</Link>
              </aside>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="bg-reva-surface py-16 sm:py-20 lg:py-24">
        <PageContainer>
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-20">
            <div className="max-w-md">
              <Text className="text-[#78434b]" variant="label">
                Qué prendas considerar
              </Text>
              <Heading className="mt-3 text-reva-primary" level={2} variant="editorial">
                Cada lote se revisa con cuidado.
              </Heading>
              <Text className="mt-4 text-reva-secondary" variant="body">
                La revisión física ayuda a determinar qué puede continuar por
                donación u otra alternativa disponible.
              </Text>
            </div>

            <dl className="grid sm:grid-cols-2 sm:gap-x-12">
              <div className="border-t border-[#c7b5a4] py-5">
                <dt className="font-serif text-2xl text-reva-primary">Ropa</dt>
                <dd className="mt-2 max-w-sm text-sm leading-6 text-reva-secondary">
                  Forma parte del alcance actual de REVA.
                </dd>
              </div>
              <div className="border-t border-[#c7b5a4] py-5">
                <dt className="font-serif text-2xl text-reva-primary">Prendas con detalles</dt>
                <dd className="mt-2 max-w-sm text-sm leading-6 text-reva-secondary">
                  Se revisan físicamente para definir qué alternativa es posible; no se garantiza un destino específico.
                </dd>
              </div>
              <div className="border-t border-[#c7b5a4] py-5">
                <dt className="font-serif text-2xl text-reva-primary">Ropa interior usada</dt>
                <dd className="mt-2 max-w-sm text-sm leading-6 text-reva-secondary">
                  No forma parte de lo que REVA acepta.
                </dd>
              </div>
              <div className="border-t border-[#c7b5a4] py-5">
                <dt className="font-serif text-2xl text-reva-primary">Zapatos y accesorios</dt>
                <dd className="mt-2 max-w-sm text-sm leading-6 text-reva-secondary">
                  Aún están fuera del alcance actual.
                </dd>
              </div>
            </dl>
          </div>
        </PageContainer>
      </section>

      <section className="overflow-hidden bg-reva-muted py-16 sm:py-20 lg:py-24">
        <PageContainer>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-end lg:gap-20">
            <div className="max-w-3xl">
              <Text className="text-[#78434b]" variant="label">
                Con honestidad
              </Text>
              <Heading className="mt-3 text-reva-primary sm:text-5xl" level={2} variant="editorial">
                Un proceso transparente, sin promesas anticipadas.
              </Heading>
            </div>
            <div className="max-w-lg border-l border-[#78434b]/35 pl-6 sm:pl-8">
              <Text className="text-reva-secondary" variant="body">
                REVA reúne las prendas hasta contar con volumen suficiente o
                una oportunidad apropiada. El momento, el destino y la forma de
                entrega dependen de que esa oportunidad pueda coordinarse.
              </Text>
              <p className="mt-6 inline-flex min-h-11 items-center border border-[#78434b]/45 px-4 text-sm font-medium text-reva-primary">
                Canal de contacto próximamente
              </p>
            </div>
          </div>
        </PageContainer>
      </section>
      <div className="bg-reva-background py-6">
        <PageContainer>
          <Link className="inline-flex min-h-11 items-center text-sm font-medium text-reva-primary underline decoration-[#78434b] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/terminos">Consulta las condiciones actuales de REVA</Link>
        </PageContainer>
      </div>
    </main>
  );
}
