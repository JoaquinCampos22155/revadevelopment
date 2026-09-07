import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import communityGathering from "@/assets/editorial/reva-community-gathering.jpeg";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Cómo funciona REVA | Ropa de segunda mano en Guatemala",
  description: "Conoce cómo REVA ayuda a dar continuidad a la ropa que ya no usas y a descubrir prendas de segunda mano en Guatemala.",
  alternates: { canonical: "/como-funciona" },
};

const processSteps = [
  ["Reúne tu lote", "Reúne al menos 15 prendas que ya no usen en casa."],
  ["Coordina la entrega", "Cuéntale a REVA qué camino te interesa y coordinemos la entrega de tus prendas."],
  ["Las revisamos", "Las revisamos físicamente y conversamos sobre su condición y las opciones disponibles."],
  ["Las valoramos", "Para las prendas que pueden venderse, definimos un precio y te contamos el monto estimado para ti."],
  ["Mostramos la pieza real", "Fotografiamos y publicamos las prendas elegibles para que puedan descubrirse tal como son."],
  ["REVA gestiona", "Nos encargamos del proceso de venta; cuando una prenda se vende, recibes la parte que le corresponde."],
] as const;

const faqItems = [
  ["¿Qué es REVA?", "REVA es un servicio integrado para dar continuidad a la ropa que ya no usas y descubrir prendas de segunda mano."],
  ["¿Tengo que vender mis prendas una por una?", "No. REVA recibe lotes de al menos 15 prendas y gestiona el trabajo de revisar y publicar las que pueden venderse."],
  ["¿Puedo donar directamente?", "Sí. Donar es una decisión disponible desde el inicio."],
  ["¿Las fotos corresponden a la prenda que voy a recibir?", "Sí. Cada Producto publicado es una pieza física única y sus fotografías muestran esa misma prenda."],
  ["¿Cada prenda es única?", "Sí. Cada Producto corresponde a una sola prenda física disponible a través de REVA."],
] as const;

type IconName = "bag" | "closet" | "community" | "camera";

function Icon({ name }: Readonly<{ name: IconName }>) {
  const paths: Record<IconName, React.ReactNode> = {
    bag: <><path d="M7 8h10l1 11H6L7 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
    closet: <><path d="M6 20V5h12v15" /><path d="M6 10h12M9 5v15m6-15v15" /></>,
    community: <><circle cx="9" cy="9" r="3" /><circle cx="16" cy="10" r="2.5" /><path d="M3.5 20c.5-3.5 2.5-5 5.5-5s5 1.5 5.5 5M14 20c.3-2.3 1.7-3.7 4-4" /></>,
    camera: <><path d="M4 8h4l1.5-2h5L16 8h4v11H4V8Z" /><circle cx="12" cy="13" r="3.5" /></>,
  };
  return <svg aria-hidden="true" className="h-8 w-8 fill-none stroke-current stroke-[1.5]" viewBox="0 0 24 24">{paths[name]}</svg>;
}

/** Explains REVA's approved integrated model without publishing unresolved policy. */
export default function HowItWorksPage() {
  return (
    <main id="main-content">
      <section className="overflow-hidden bg-reva-background py-10 sm:py-12 lg:py-18">
        <PageContainer>
          <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
            <div className="relative z-10 max-w-xl space-y-5 lg:py-4">
              <Text className="text-reva-brand-strong" variant="label">Cómo funciona REVA</Text>
              <Heading className="leading-[0.98] text-reva-primary sm:text-5xl lg:text-6xl" level={1} variant="editorial">
                Tú <span className="text-reva-brand">decides</span> qué hacer con tu ropa. <span className=" font-serif font-semibold uppercase tracking-[0.08em] text-reva-brand-strong">REVA</span> lo <span className="text-reva-brand">hace</span> por tí.
              </Heading>
              <Text className="max-w-xl text-lg text-reva-secondary sm:text-xl" variant="body">Recibimos la ropa que ya no usas para ayudar a que encuentre un siguiente camino: venta, donación y una nueva oportunidad de circular.</Text>
              <div className="flex flex-wrap gap-3 pt-1"><Button href="/catalogo" variant="solid">Explorar prendas</Button><Button href="/vender" variant="outline">Quiero vender</Button></div>
            </div>
            <div className="relative mx-auto w-full max-w-xl lg:max-w-[420px] lg:justify-self-end">
              <div aria-hidden="true" className="absolute -inset-x-4 bottom-8 top-12 rotate-2 bg-reva-strong sm:-inset-x-8" />
              <div aria-hidden="true" className="absolute -right-3 top-5 h-20 w-20 rounded-full border-2 border-reva-brand sm:-right-8 sm:h-32 sm:w-32" />
              <Image alt="Personas reunidas alrededor de prendas en un espacio comunitario." className="relative aspect-[4/5] w-full object-cover object-[center_52%] shadow-xl transition-transform duration-500 motion-reduce:transition-none lg:h-[460px] lg:aspect-auto lg:hover:scale-[1.015]" priority sizes="(min-width: 1024px) 420px, 100vw" src={communityGathering} />
              <div className="relative ml-auto -mt-12 mr-4 max-w-[17rem] bg-reva-surface p-4 shadow-lg sm:mr-8 sm:max-w-xs sm:p-5"><Text className="text-reva-brand-strong" variant="label">Una idea simple</Text><p className="mt-2 font-serif text-xl leading-snug text-reva-primary">Una caja. Varias posibilidades.</p></div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="bg-reva-surface py-14 sm:py-20"><PageContainer><div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20"><div className="max-w-md"><Text className="text-reva-brand-strong" variant="label">El problema que queremos cambiar</Text><Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Tu ropa todavía puede tener otra historia.</Heading></div><div className="relative max-w-2xl space-y-5"><Text className="text-reva-secondary" variant="body">Limpiar un clóset puede dejar muchas prendas con historia, pero venderlas una por una exige tiempo, publicaciones, conversaciones y coordinación. También puede ser difícil saber cómo donarlas de forma directa.</Text><Text className="text-reva-secondary" variant="body">REVA hace ese recorrido más claro: reúne las prendas, las revisa con calma y ayuda a que vuelvan a circular cuando es posible.</Text><div className="mt-8 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 border-l-2 border-reva-brand pl-5 text-reva-primary"><span className="font-serif text-4xl text-reva-brand">×</span><p className="font-medium">Publicar, responder, coordinar y vender cada prenda por separado.</p><span className="font-serif text-4xl text-reva-brand">→</span><p className="font-medium">Un lote de prendas y REVA haciendo el trabajo operativo.</p></div></div></div></PageContainer></section>

      <section className="bg-reva-muted py-14 sm:py-20"><PageContainer><div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center"><div className="max-w-xl"><Text className="text-reva-brand-strong" variant="label">Una caja... Varias posibilidades.</Text><Heading className="mt-3 text-reva-primary" level={2} variant="editorial">No tienes que resolver cada prenda por tu cuenta.</Heading><Text className="mt-4 text-reva-secondary" variant="body">Reúne al menos 15 prendas que ya no uses. Tú decides qué quieres hacer con ese lote; REVA lo revisa y confirma qué caminos son posibles.</Text></div><div className="relative mx-auto w-full max-w-lg border border-reva-border bg-reva-surface p-6 shadow-sm sm:p-8"><div className="text-center"><p className="font-serif text-3xl text-reva-primary">Tu lote</p><p className="mt-1 text-sm text-reva-secondary">mínimo 15 prendas</p><div className="mx-auto my-4 h-8 w-px bg-reva-brand" /><div className="inline-flex items-center gap-3 bg-reva-strong px-5 py-3 text-reva-primary"><span className="font-serif text-2xl">REVA</span><span className="h-5 w-px bg-reva-brand" /><span className="text-sm">revisa y orienta</span></div></div><div className="mt-5 grid grid-cols-3 gap-2 border-t border-reva-border pt-5 text-center text-sm font-medium text-reva-primary"><span>Vender</span><span>Donar</span><span>Otra opción</span></div></div></div></PageContainer></section>

      <section className="bg-reva-background py-14 sm:py-20 lg:py-24"><PageContainer><div className="max-w-2xl"><Text className="text-reva-brand-strong" variant="label">Cómo funciona REVA</Text><Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Tus prendas avanzan con un propósito.</Heading></div><ol className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">{processSteps.map(([title, description], index) => <li className="group relative border-l-2 border-reva-border py-2 pl-6 transition-colors duration-200 hover:border-reva-brand focus-within:border-reva-brand motion-reduce:transition-none" key={title}><span aria-hidden="true" className="absolute -left-3 top-1 grid h-6 w-6 place-items-center rounded-full bg-reva-background font-serif text-sm text-reva-brand ring-2 ring-reva-brand">{index + 1}</span><Heading className="text-reva-primary" level={3} variant="editorial">{title}</Heading><Text className="mt-3 max-w-sm text-reva-secondary" variant="body">{description}</Text></li>)}</ol></PageContainer></section>

      <section className="bg-reva-strong py-14 sm:py-20"><PageContainer><div className="max-w-xl"><Text className="text-reva-brand-strong" variant="label">Un mismo ecosistema</Text><Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Compra, venta y donación se conectan sin ser lo mismo.</Heading></div><div className="mt-10 grid gap-5 md:grid-cols-3"><article className="group relative overflow-hidden bg-reva-surface p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none"><div className="text-reva-brand"><Icon name="bag" /></div><Heading className="mt-6 text-reva-primary" level={3} variant="editorial">Comprar segunda mano</Heading><Text className="mt-3 text-reva-secondary" variant="body">Explora piezas únicas, revisadas y fotografiadas tal como son.</Text><Button className="mt-6" href="/catalogo" variant="outline">Explorar el Catálogo</Button></article><article className="group relative overflow-hidden bg-reva-muted p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none"><div className="text-reva-brand"><Icon name="closet" /></div><Heading className="mt-6 text-reva-primary" level={3} variant="editorial">Vender con REVA</Heading><Text className="mt-3 text-reva-secondary" variant="body">Entréganos un lote y REVA se encarga de revisar, valorar y publicar las prendas elegibles.</Text><Button className="mt-6" href="/vender" variant="outline">Conocer el proceso</Button></article><article className="group relative overflow-hidden bg-reva-surface p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none"><div className="text-reva-brand"><Icon name="community" /></div><Heading className="mt-6 text-reva-primary" level={3} variant="editorial">Donar</Heading><Text className="mt-3 text-reva-secondary" variant="body">Elige desde el inicio otro camino para tus prendas mediante donación.</Text><Button className="mt-6" href="/donar" variant="outline">Conocer donación</Button></article></div></PageContainer></section>

      <section className="bg-reva-surface py-14 sm:py-20"><PageContainer><div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-20"><div className="relative order-2 lg:order-1"><div aria-hidden="true" className="absolute -bottom-5 -left-4 h-full w-full border border-reva-brand sm:-left-6" /><div className="relative bg-reva-muted p-7 sm:p-10"><div className="text-reva-brand"><Icon name="camera" /></div><Text className="mt-5 text-reva-brand-strong" variant="label">Confianza en cada prenda</Text><Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Lo que ves es la pieza real.</Heading><Text className="mt-4 text-reva-secondary" variant="body">Cada Producto publicado corresponde a una prenda física única. Sus fotografías, talla, condición y detalles buscan ayudarte a decidir con más claridad.</Text></div></div><div className="order-1 max-w-xl lg:order-2"><Text className="text-reva-brand-strong" variant="label">Revisadas y seleccionadas</Text><Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Información para descubrir segunda mano con confianza.</Heading><div className="mt-5 flex flex-wrap gap-2">{["Con detalles", "Buen estado", "Como nuevo", "Nuevo con etiqueta"].map((condition) => <span className="border border-reva-border bg-reva-background px-3 py-1.5 text-sm font-medium text-reva-primary" key={condition}>{condition}</span>)}</div><Text className="mt-5 text-reva-secondary" variant="body">Estas etiquetas describen la condición de cada prenda; no son calificaciones ni reseñas.</Text><Button className="mt-6" href="/catalogo" variant="solid">Ver prendas disponibles</Button></div></div></PageContainer></section>

      <section className="bg-reva-background py-14 sm:py-20"><PageContainer><div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20"><div className="max-w-md"><Text className="text-reva-brand-strong" variant="label">Preguntas frecuentes</Text><Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Lo esencial, antes de empezar.</Heading></div><div className="divide-y divide-reva-border border-y border-reva-border">{faqItems.map(([question, answer]) => <details className="group py-4" key={question}><summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-medium text-reva-primary marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-4 focus-visible:ring-offset-reva-background">{question}<span aria-hidden="true" className="text-2xl text-reva-brand transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none">+</span></summary><p className="max-w-2xl pt-3 text-base leading-7 text-reva-secondary">{answer}</p></details>)}</div></div></PageContainer></section>

      <section className="bg-reva-action pb-10 pt-14 sm:pb-12 sm:pt-20"><PageContainer><div className="max-w-3xl"><Text className="text-reva-on-action/75" variant="label">Tu siguiente paso</Text><Heading className="mt-3 text-reva-on-action sm:text-5xl" level={2} variant="editorial">Explora prendas con historia o empieza a dar continuidad a las tuyas.</Heading><div className="mt-7 flex flex-wrap gap-3"><Button className="border-reva-surface bg-reva-surface text-reva-primary hover:bg-reva-muted" href="/catalogo" variant="outline">Explorar el Catálogo</Button><Link className="inline-flex min-h-11 items-center justify-center border border-reva-on-action px-5 text-sm font-medium text-reva-on-action transition-colors hover:bg-reva-on-action hover:text-reva-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-surface focus-visible:ring-offset-2 focus-visible:ring-offset-reva-action" href="/vender">Conocer Vender</Link></div></div></PageContainer></section>
    </main>
  );
}
