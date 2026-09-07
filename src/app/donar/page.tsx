import type { Metadata } from "next";
import Image from "next/image";

import donationClothingHandover from "@/assets/donation-clothing-handover.png";
import donationGarmentLot from "@/assets/editorial/reva-donation-garment-lot-editorial.png";
import { PageContainer } from "@/components/layout/PageContainer";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Donar ropa en Guatemala | REVA",
  description: "Conoce cómo donar ropa a REVA y darle continuidad a prendas que ya no usas.",
  alternates: { canonical: "/donar" },
};

const entrySteps = [
  ["Reúne tu lote", "Prepara al menos 15 prendas que quieras donar."],
  ["Contacta a REVA", "Elige la donación desde el inicio; no necesitas intentar vender primero."],
  ["Coordina la entrega", "Coordinamos cómo entregar el lote a REVA antes de avanzar."],
] as const;

const faqItems = [
  ["¿Puedo donar directamente sin intentar vender?", "Sí. Donar es un camino distinto desde el inicio; no necesitas intentar vender tus prendas primero."],
  ["¿Qué tipo de prendas puedo donar?", "REVA recibe ropa. La ropa interior usada, zapatos y accesorios no forman parte del alcance actual."],
  ["¿Qué hace REVA con las prendas donadas?", "REVA las recibe y revisa; puede acumularlas hasta contar con volumen suficiente o coordinar una oportunidad de entrega apropiada."],
  ["¿Cuándo se entregan las donaciones?", "El momento depende del volumen reunido y de las oportunidades de donación que se puedan coordinar. No hay una fecha fija prometida."],
  ["¿Puedo donar prendas con detalles?", "Puedes incluirlas en el lote. REVA las revisará para identificar si pueden continuar mediante donación u otra alternativa futura."],
] as const;

function ArrowDownIcon({ className }: { className?: string }) {
  return <svg aria-hidden="true" className={`h-6 w-6 fill-none stroke-current stroke-[1.7] ${className ?? ""}`} viewBox="0 0 24 24"><path d="M12 3v17M5 13l7 7 7-7" /></svg>;
}

/** Explains donation as an approved, distinct REVA journey without inventing recipients or logistics. */
export default function DonatePage() {
  return <main id="main-content">
    <section className="relative overflow-hidden bg-reva-strong pb-12">
      <PageContainer>
        <div className="grid gap-8 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-12">
          <div className="relative z-10 max-w-xl lg:pb-20 ">
            <Text className="text-reva-brand-strong" variant="label">Donar con REVA</Text>
            <Heading className="leading-[0.98] text-reva-primary sm:text-5xl lg:text-6xl" level={1} variant="editorial">Donar también es darle <span className="text-reva-brand">continuidad</span> a tu ropa.</Heading>
            <Text className="max-w-lg text-lg text-reva-secondary sm:text-xl" variant="body">Puedes elegir donar desde el inicio. Reúne tus prendas y REVA las recibe para que puedan llegar más lejos cuando exista la oportunidad adecuada.</Text>
            <p className="inline-flex min-h-11 items-center border border-reva-border bg-reva-surface px-5 text-sm font-medium text-reva-primary">Canal de contacto próximamente</p>
          </div>
          <figure className="relative mx-auto w-full max-w-2xl lg:translate-y-12 lg:justify-self-end">
            <div aria-hidden="true" className="absolute -left-4 top-8 h-[86%] w-[88%] -rotate-2 border border-reva-brand sm:-left-7" />
            <Image alt="Dos personas sostienen una caja con prendas para entregar." className="relative aspect-[16/10] w-full object-cover object-center shadow-xl lg:aspect-[7/5]" priority sizes="(min-width: 1024px) 56vw, 100vw" src={donationClothingHandover} />
            <figcaption className="relative ml-auto -mt-8 mr-4 max-w-[17rem] bg-reva-surface p-3 text-sm leading-6 text-reva-secondary shadow-lg sm:mr-8">Una decisión individual puede sumarse a un esfuerzo colectivo.</figcaption>
          </figure>
        </div>
      </PageContainer>
    </section>

    <section className="bg-reva-surface py-16 sm:py-24 lg:pt-32">
      <PageContainer>
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div className="max-w-md">
            <Text className="text-reva-brand-strong" variant="label">Una decisión directa</Text>
            <Heading className="mt-3 text-reva-primary" level={2} variant="editorial">No tienes que vender primero para donar.</Heading>
          </div>
          <div className="max-w-3xl border-l-2 border-reva-brand pl-6 sm:pl-8">
            <p className="font-serif text-3xl leading-tight text-reva-primary sm:text-4xl">Tú decides desde el inicio que tus prendas sigan circulando mediante donación.</p>
            <Text className="mt-5 max-w-2xl text-reva-secondary" variant="body">REVA recibe el lote, lo revisa y lo acumula hasta contar con volumen suficiente o poder coordinar una oportunidad de entrega.</Text>
          </div>
        </div>
      </PageContainer>
    </section>

    <section className="overflow-hidden bg-reva-muted py-16 sm:py-20">
      <PageContainer>
        <div className="max-w-xl">
          <Text className="text-reva-brand-strong" variant="label">Cuando las prendas se reúnen</Text>
          <Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Una prenda se suma. Un lote puede abrir una oportunidad.</Heading>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.74fr_1.26fr] lg:items-center lg:gap-14">
          <figure className="relative mx-auto w-full max-w-xl">
            <div aria-hidden="true" className="absolute -bottom-4 -right-4 h-[76%] w-[83%] bg-reva-action sm:-bottom-6 sm:-right-6" />
            <Image alt="Mano organizando un lote de prendas para donar." className="relative aspect-[5/4] w-full object-cover object-center shadow-xl" sizes="(min-width: 1024px) 36vw, 100vw" src={donationGarmentLot} />
            <figcaption className="relative ml-4 -mt-7 max-w-[16rem] bg-reva-surface p-3 text-sm leading-6 text-reva-secondary shadow-lg sm:ml-7">Preparar un lote es el primer gesto de continuidad.</figcaption>
          </figure>
          <div className="group grid gap-5 lg:grid-cols-[1fr_auto_0.78fr_auto_1fr] lg:items-center">

            <div aria-hidden="true" className="justify-self-center text-reva-brand"><ArrowDownIcon className="lg:-rotate-90" /></div>
            <div className="relative border-y border-reva-brand py-7 text-center text-reva-primary">
              <p className="font-serif text-4xl">REVA</p>
              <p className="mt-2 text-sm text-reva-secondary">recibe y revisa</p>
            </div>
            <div aria-hidden="true" className="justify-self-center text-reva-brand"><ArrowDownIcon className="lg:-rotate-90" /></div>
            <div className="border-l-2 border-reva-brand pl-6">
              <p className="font-serif text-3xl leading-tight text-reva-primary">Volumen para una entrega con propósito.</p>
              <Text className="mt-3 text-reva-secondary" variant="quiet">La entrega ocurre cuando existe volumen suficiente o una oportunidad apropiada para coordinarla.</Text>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>

    <section className="bg-reva-background py-16 sm:py-20">
      <PageContainer>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <div>
            <Text className="text-reva-brand-strong" variant="label">Tu parte es simple</Text>
            <Heading className="mt-3 max-w-xl text-reva-primary" level={2} variant="editorial">Reunir ropa que ya no necesitas también puede ser un acto de comunidad.</Heading>
            <Text className="mt-4 max-w-xl text-reva-secondary" variant="body">Cada lote se integra con cuidado al proceso de REVA. La donación no garantiza un beneficio material: su valor está en elegir dar continuidad a prendas que todavía pueden servir.</Text>
          </div>
          <ol className="grid gap-5 sm:grid-cols-3">
            {entrySteps.map(([title, description], index) => <li className="border-t-2 border-reva-brand pt-4" key={title}><span className="font-serif text-3xl text-reva-strong">0{index + 1}</span><Heading className="mt-2 text-reva-primary" level={3} variant="editorial">{title}</Heading><Text className="mt-3 text-reva-secondary" variant="quiet">{description}</Text></li>)}
          </ol>
        </div>
      </PageContainer>
    </section>

    <section className="bg-reva-strong py-16 sm:py-20">
      <PageContainer>
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="max-w-md">
            <Text className="text-reva-brand-strong" variant="label">Qué puedes incluir</Text>
            <Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Ropa que pueda encontrar otra posibilidad.</Heading>
          </div>
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div className="border-t border-reva-border pt-4"><dt className="font-medium text-reva-primary">Ropa</dt><dd className="mt-2 text-sm leading-6 text-reva-secondary">Sí forma parte del alcance actual de REVA.</dd></div>
            <div className="border-t border-reva-border pt-4"><dt className="font-medium text-reva-primary">Ropa interior usada</dt><dd className="mt-2 text-sm leading-6 text-reva-secondary">No se acepta.</dd></div>
            <div className="border-t border-reva-border pt-4"><dt className="font-medium text-reva-primary">Zapatos y accesorios</dt><dd className="mt-2 text-sm leading-6 text-reva-secondary">Aún no forman parte del alcance MVP.</dd></div>
            <div className="border-t border-reva-border pt-4"><dt className="font-medium text-reva-primary">Prendas con detalles</dt><dd className="mt-2 text-sm leading-6 text-reva-secondary">Puedes incluirlas; REVA las revisa antes de definir qué camino es posible.</dd></div>
          </dl>
        </div>
      </PageContainer>
    </section>

    <section className="bg-reva-surface py-16 sm:py-20">
      <PageContainer>
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <div className="max-w-md">
            <Text className="text-reva-brand-strong" variant="label">Con honestidad</Text>
            <Heading className="mt-3 text-reva-primary" level={2} variant="editorial">No todo puede continuar de la misma manera.</Heading>
          </div>
          <div className="max-w-2xl border-l-2 border-reva-brand pl-6 sm:pl-8">
            <Text className="text-reva-secondary" variant="body">Hay prendas que no pueden seguir circulando mediante venta o donación. REVA está trabajando para ampliar las alternativas para esos casos, sin prometer todavía un destino específico.</Text>
            <Text className="mt-5 text-reva-secondary" variant="quiet">También queremos compartir con la comunidad evidencia ética y segura de futuras entregas cuando el proceso esté listo para hacerlo.</Text>
          </div>
        </div>
      </PageContainer>
    </section>

    <section className="bg-reva-background py-16 sm:py-20">
      <PageContainer>
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <Text className="text-reva-brand-strong" variant="label">Preguntas frecuentes</Text>
            <Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Lo esencial para donar con REVA.</Heading>
          </div>
          <div className="divide-y divide-reva-border border-y border-reva-border">
            {faqItems.map(([question, answer]) => <details className="group py-4" key={question}><summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-medium text-reva-primary marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-4 focus-visible:ring-offset-reva-background">{question}<span aria-hidden="true" className="text-2xl text-reva-brand transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none">+</span></summary><p className="max-w-2xl pt-3 text-base leading-7 text-reva-secondary">{answer}</p></details>)}
          </div>
        </div>
      </PageContainer>
    </section>

    <section className="bg-reva-action py-16 sm:py-20">
      <PageContainer>
        <div className="max-w-3xl">
          <Text className="text-reva-on-action/75" variant="label">Donar con REVA</Text>
          <Heading className="mt-3 text-reva-on-action sm:text-5xl" level={2} variant="editorial">Cuando el canal esté disponible, podrás iniciar tu donación desde aquí.</Heading>
          <p className="mt-6 inline-flex min-h-11 items-center border border-reva-on-action/70 px-5 text-sm font-medium text-reva-on-action">Canal de contacto próximamente</p>
        </div>
      </PageContainer>
    </section>
  </main>;
}
