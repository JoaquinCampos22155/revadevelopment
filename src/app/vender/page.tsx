import type { Metadata } from "next";
import Image from "next/image";

import garmentOffering from "@/assets/editorial/reva-garment-offering.jpeg";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { getWhatsAppSellingUrl } from "@/infrastructure/config/site-contact";

export const metadata: Metadata = {
  title: "Vender ropa usada en Guatemala | REVA",
  description: "Vende ropa de segunda mano con REVA: reúne un lote, coordinamos la entrega y nos encargamos del proceso de venta.",
  alternates: { canonical: "/vender" },
};

const entrySteps = [
  ["Reúne tu lote", "Reúne al menos 15 prendas que ya no uses."],
  ["Contacta a REVA", "Cuéntanos qué camino te interesa iniciar."],
  ["Coordina la entrega", "Coordinamos la entrega de tus prendas con REVA."],
] as const;

const revaWork = ["Revisamos", "Valoramos", "Fotografiamos", "Publicamos", "Gestionamos"] as const;

const individualWork = [
  ["camera", "Fotografiar cada prenda"],
  ["file-image", "Preparar y publicar cada anuncio"],
  ["message", "Responder mensajes de personas interesadas"],
  ["calendar", "Dar seguimiento a las publicaciones"],
  ["list", "Gestionar cada pieza por separado"],
] as const;

const faqItems = [
  ["¿Cuántas prendas necesito para empezar?", "Necesitas reunir al menos 15 prendas que ya no uses."],
  ["¿Tengo que fotografiar o publicar mis prendas?", "No. REVA se encarga de fotografiar las prendas elegibles y crear su publicación."],
  ["¿Quién define el precio?", "REVA define el precio considerando factores como condición, marca, características de la prenda y contexto de mercado."],
  ["¿Cuánto tiempo intenta REVA venderlas?", "REVA intenta vender las prendas elegibles durante hasta 90 días desde la recepción física del lote."],
  ["¿Qué pasa si una prenda no se vende?", "Al final del período podrás decidir si prefieres donarla o recibirla de vuelta. Si eliges recibirla, el envío de regreso corre por tu cuenta."],
] as const;

function CheckIcon() {
  return <svg aria-hidden="true" className="h-6 w-6 fill-none stroke-current stroke-[1.7]" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>;
}

type WorkIconName = (typeof individualWork)[number][0];

/** Local, dependency-free SVG icons keep the operational comparison clear. */
function WorkIcon({ name }: { name: WorkIconName }) {
  const paths = {
    camera: <><path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" /><circle cx="12" cy="13" r="3" /></>,
    "file-image": <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 16l2.5-2.5 2 2L15 13l3 3" /></>,
    message: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.6 9.6 0 0 1-4.1-.9L3 20l1.2-4.1A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z" />,
    calendar: <><rect height="18" rx="2" width="18" x="3" y="4" /><path d="M16 2v4M8 2v4M3 10h18M8 15h3M8 18h5" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
  } satisfies Record<WorkIconName, React.ReactNode>;

  return <svg aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.65]" viewBox="0 0 24 24">{paths[name]}</svg>;
}

/** Explains REVA's approved lot-based selling model without creating an Intake. */
export default function SellPage() {
  const whatsappUrl = getWhatsAppSellingUrl();
  const startBoundary = whatsappUrl ? <Button href={whatsappUrl} variant="solid">Quiero empezar</Button> : <p className="text-sm text-reva-secondary">El canal para iniciar este proceso estará disponible próximamente.</p>;
  const finalStartBoundary = whatsappUrl ? <Button className="border border-reva-surface bg-reva-surface text-reva-primary hover:bg-reva-muted" href={whatsappUrl} variant="outline">Quiero empezar</Button> : <p className="text-sm text-reva-on-action">El canal para iniciar este proceso estará disponible próximamente.</p>;

  return <main id="main-content">
    <section className="overflow-hidden bg-reva-strong py-10 sm:py-12 lg:py-14"><PageContainer><div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12"><div className="relative z-10 max-w-xl space-y-5 lg:py-4"><Text className="text-reva-brand-strong" variant="label">Vender con REVA</Text><Heading className="leading-[0.98] text-reva-primary sm:text-5xl lg:text-6xl" level={1} variant="editorial">¿Tienes ropa acumulada que ya no usas? <span className="text-reva-brand">Nosotros la vendemos por tí.</span></Heading><Text className="text-lg text-reva-secondary sm:text-xl" variant="body">Reúne tu lote, contacta a REVA y deja que nos encarguemos del trabajo operativo de vender las prendas elegibles.</Text>{startBoundary}</div><figure className="relative mx-auto w-full max-w-xl lg:max-w-[420px] lg:justify-self-end"><div aria-hidden="true" className="absolute -bottom-5 -left-5 h-[78%] w-[85%] -rotate-2 bg-reva-action sm:-left-9" /><Image alt="Personas entregando prendas a REVA." className="relative aspect-[5/4] w-full object-cover object-[center_44%] shadow-xl lg:h-[360px] lg:aspect-auto" priority sizes="(min-width: 1024px) 420px, 100vw" src={garmentOffering} /><figcaption className="relative ml-auto -mt-8 mr-4 max-w-[16rem] bg-reva-surface p-3 text-sm leading-6 text-reva-secondary shadow-lg sm:mr-8">Tu ropa puede seguir circulando sin que tengas que gestionar cada pieza por separado.</figcaption></figure></div></PageContainer></section>

    <section className="bg-reva-background py-14 sm:py-20"><PageContainer><div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"><div className="max-w-md"><Text className="text-reva-brand-strong" variant="label">El trabajo que te ahorramos</Text><Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Menos gestión individual. Más continuidad para tus prendas.</Heading><Text className="mt-4 text-reva-secondary" variant="body">No tienes que encargarte de fotografiar, publicar ni gestionar cada prenda.</Text></div><div className="grid gap-7 sm:grid-cols-[1fr_auto_1fr] sm:items-center"><div className="border-l-2 border-reva-border pl-5"><Text className="text-reva-secondary" variant="label">Por tu cuenta</Text><ul className="mt-5 space-y-3.5 text-reva-secondary">{individualWork.map(([icon, item]) => <li className="flex items-center gap-3" key={item}><span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center border border-reva-border bg-reva-surface text-reva-brand"><WorkIcon name={icon} /></span><span>{item}</span></li>)}</ul></div><span aria-hidden="true" className="hidden font-serif text-5xl text-reva-brand sm:block">→</span><div className="relative overflow-hidden bg-reva-muted p-6 shadow-sm"><div aria-hidden="true" className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[14px] border-reva-surface/70" /><Text className="relative text-reva-brand-strong" variant="label">Con REVA</Text><p className="relative mt-3 font-serif text-3xl leading-tight text-reva-primary">Un lote, un proceso. REVA se encarga.</p><Text className="relative mt-4 text-reva-secondary" variant="body">Tú reúnes las prendas y coordinas la entrega; nosotros gestionamos el resto.</Text><div className="relative mt-6 grid grid-cols-3 gap-3 border-t border-reva-border pt-4 text-center"><div><span aria-hidden="true" className="mx-auto grid h-9 w-9 place-items-center bg-reva-surface text-reva-brand"><WorkIcon name="camera" /></span><p className="mt-2 text-xs font-medium text-reva-primary">Fotografía</p></div><div><span aria-hidden="true" className="mx-auto grid h-9 w-9 place-items-center bg-reva-surface text-reva-brand"><WorkIcon name="file-image" /></span><p className="mt-2 text-xs font-medium text-reva-primary">Publicación</p></div><div><span aria-hidden="true" className="mx-auto grid h-9 w-9 place-items-center bg-reva-surface text-reva-brand"><WorkIcon name="list" /></span><p className="mt-2 text-xs font-medium text-reva-primary">Gestión</p></div></div></div></div></div></PageContainer></section>

    <section className="bg-reva-surface py-14 sm:py-20"><PageContainer><div className="max-w-xl"><Text className="text-reva-brand-strong" variant="label">Tu recorrido con REVA</Text><Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Tres pasos tuyos. Después, REVA toma el relevo.</Heading></div><div className="mt-10 grid gap-10 lg:grid-cols-[0.82fr_auto_1.18fr] lg:items-stretch"><ol className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">{entrySteps.map(([title, description], index) => <li className="border-l-2 border-reva-brand pl-5" key={title}><span className="font-serif text-3xl text-reva-strong">0{index + 1}</span><Heading className="mt-1 text-reva-primary" level={3} variant="editorial">{title}</Heading><Text className="mt-2 text-reva-secondary" variant="quiet">{description}</Text></li>)}</ol><div aria-hidden="true" className="hidden w-px bg-reva-brand lg:block" /><div className="relative bg-reva-muted p-6 shadow-sm sm:p-8"><Text className="text-reva-brand-strong" variant="label">REVA</Text><Heading className="mt-2 text-reva-primary" level={3} variant="editorial">Revisa, valora y gestiona el resto.</Heading><Text className="mt-3 max-w-xl text-reva-secondary" variant="body">Revisamos físicamente cada prenda para entender su condición, talla, marca y posibilidades. No todas están garantizadas para reventa.</Text><div className="mt-7 grid gap-3 sm:grid-cols-5">{revaWork.map((verb, index) => <div className="border-b-2 border-reva-brand pb-2" key={verb}><span className="font-serif text-2xl text-reva-strong">0{index + 1}</span><p className="mt-1 font-serif text-lg text-reva-primary">{verb}</p></div>)}</div></div></div></PageContainer></section>

    <section className="bg-reva-background py-14 sm:py-20"><PageContainer><div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-20"><div className="relative border border-reva-border bg-reva-surface p-7 shadow-sm sm:p-10"><Text className="text-reva-brand-strong" variant="label">Valoración y publicación</Text><Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Antes de publicar, sabes lo que podrías recibir.</Heading><Text className="mt-4 text-reva-secondary" variant="body">REVA define el precio de las prendas elegibles según su condición, marca, características y contexto de mercado. Antes de publicarlas, te indicamos el monto estimado para ti.</Text><div className="mt-6 flex items-center gap-3 text-reva-brand"><CheckIcon /><span className="text-sm font-medium">Nosotros fotografiamos y publicamos la pieza real.</span></div></div><aside className="relative border-l-2 border-reva-brand pl-6"><Text className="text-reva-brand-strong" variant="label">El ciclo de venta</Text><p className="mt-3 font-serif text-6xl leading-none text-reva-primary">90</p><p className="font-serif text-2xl text-reva-primary">días como máximo</p><Text className="mt-4 text-reva-secondary" variant="body">Desde que recibimos físicamente tu lote, REVA intenta vender las prendas elegibles y gestiona su publicación.</Text><div className="mt-6 h-px w-full bg-reva-border"><div className="h-px w-3/4 bg-reva-brand" /></div></aside></div></PageContainer></section>

    <section className="bg-reva-strong py-14 sm:py-20"><PageContainer><div className="grid gap-8 lg:grid-cols-2 lg:gap-16"><div><Text className="text-reva-brand-strong" variant="label">Cuando una prenda se vende</Text><Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Cada venta suma a lo que recibes.</Heading><Text className="mt-4 text-reva-secondary" variant="body">Cuando se vende una prenda, recibes la parte que le corresponde. No tienes que esperar a que se venda todo el lote.</Text></div><div className="border-l-2 border-reva-brand pl-6"><Text className="text-reva-brand-strong" variant="label">Al terminar el período</Text><Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Las que no se vendieron vuelven a ser tu decisión.</Heading><div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-medium text-reva-primary"><span className="bg-reva-surface px-4 py-2">Donarlas</span><span>o</span><span className="border border-reva-border px-4 py-2">Recibirlas de vuelta</span></div><Text className="mt-4 text-reva-secondary" variant="quiet">Si eliges recibirlas de vuelta, el envío de regreso corre por tu cuenta.</Text></div></div></PageContainer></section>

    <section className="bg-reva-surface py-14 sm:py-20"><PageContainer><div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20"><div><Text className="text-reva-brand-strong" variant="label">Preguntas frecuentes</Text><Heading className="mt-3 text-reva-primary" level={2} variant="editorial">Lo esencial para vender con REVA.</Heading></div><div className="divide-y divide-reva-border border-y border-reva-border">{faqItems.map(([question, answer]) => <details className="group py-4" key={question}><summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-medium text-reva-primary marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-4 focus-visible:ring-offset-reva-surface">{question}<span aria-hidden="true" className="text-2xl text-reva-brand transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none">+</span></summary><p className="max-w-2xl pt-3 text-base leading-7 text-reva-secondary">{answer}</p></details>)}</div></div></PageContainer></section>

    <section className="bg-reva-action py-14 sm:py-20"><PageContainer><div className="max-w-3xl"><Text className="text-reva-on-action/75" variant="label">¿Listo para empezar?</Text><Heading className="mt-3 text-reva-on-action sm:text-5xl" level={2} variant="editorial">Reúne tus prendas y deja que REVA se encargue del resto.</Heading><div className="mt-7">{finalStartBoundary}</div></div></PageContainer></section>
  </main>;
}
