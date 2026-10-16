"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

import denimImage from "@/assets/product-denim-front.svg";
import { INITIAL_BILLING_DEMO, selectBillingDemoType, updateBillingDemoNit, updateBillingDemoRecipientName, type BillingDemoType } from "@/features/checkout-prototype/billing-demo";
import { findGuatemalaMunicipality, getVerifiedZoneCatalog, GUATEMALA_MUNICIPALITIES, type GuatemalaMunicipalityCode } from "@/features/checkout-prototype/municipalities";

type EntryContext = "cart" | "product";

const demoContact = {
  name: "María Ejemplo",
  email: "maria.ejemplo@example.test",
  phone: "0000-0000",
  address: "Avenida de demostración 12-34",
  complement: "Casa de muestra",
};

const demoProducts = {
  cart: [
    { title: "Chaqueta de mezclilla azul", detail: "Talla M · Buen estado", price: "Q 325.00", image: true },
    { title: "Pieza de muestra", detail: "Talla única · Buen estado", price: "Q 190.00", image: false },
  ],
  product: [
    { title: "Chaqueta de mezclilla azul", detail: "Talla M · Buen estado", price: "Q 325.00", image: true },
  ],
} as const;

const fieldClass = "mt-2 min-h-12 w-full rounded-xl border border-[#b7c3c4] bg-white px-3.5 text-sm text-reva-primary shadow-sm outline-none transition placeholder:text-reva-secondary/80 focus:border-reva-action focus:ring-2 focus:ring-reva-focus/30";
const labelClass = "block text-sm font-semibold text-reva-primary";

function SectionMarker({ number, eyebrow, headingId, title }: Readonly<{ number: string; eyebrow: string; headingId: string; title: string }>) {
  return <div className="flex gap-4 sm:gap-5">
    <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full border border-reva-border bg-white font-serif text-lg text-reva-brand-strong shadow-sm">{number}</span>
    <div className="min-w-0">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-reva-secondary">{eyebrow}</p>
      <h2 className="mt-1 font-serif text-2xl leading-tight text-reva-primary sm:text-[1.8rem]" id={headingId}>{title}</h2>
    </div>
  </div>;
}

export function CheckoutPrototype() {
  const [entry, setEntry] = useState<EntryContext>("cart");
  const [municipalityCode, setMunicipalityCode] = useState<GuatemalaMunicipalityCode>("0101");
  const [billing, setBilling] = useState(INITIAL_BILLING_DEMO);
  const [reviewReady, setReviewReady] = useState(false);
  const [contact, setContact] = useState(demoContact);
  const [zone, setZone] = useState("");
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  const municipality = findGuatemalaMunicipality(municipalityCode);
  const zoneCatalog = getVerifiedZoneCatalog(municipalityCode);
  const products = demoProducts[entry];
  const subtotalCents = products.reduce((total, product) => {
    const amount = product.price.replace(/^Q\s*/, "");
    const [whole, fraction] = amount.split(".");
    return total + Number(whole) * 100 + Number(fraction);
  }, 0);
  const subtotal = `Q ${Math.floor(subtotalCents / 100)}.${String(subtotalCents % 100).padStart(2, "0")}`;

  useEffect(() => {
    if (reviewReady) reviewHeading.current?.focus();
  }, [reviewReady]);

  function updateContact(field: keyof typeof demoContact, value: string) {
    setContact((current) => ({ ...current, [field]: value }));
    setReviewReady(false);
  }

  function updateBillingType(value: BillingDemoType) {
    setBilling((current) => selectBillingDemoType(current, value));
    setReviewReady(false);
  }

  function showReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReviewReady(true);
  }

  return <main className="min-h-screen bg-reva-background pb-16 text-reva-primary" id="main-content">
    <header className="relative overflow-hidden border-b border-reva-border/70 bg-[radial-gradient(ellipse_at_78%_14%,rgba(98,127,138,0.17),transparent_42%),linear-gradient(135deg,#f7f8f5_0%,#eef2f0_62%,#f5efed_100%)]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-28 size-80 rounded-full border border-reva-brand-strong/10 sm:right-[8%] sm:size-[28rem]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-7 sm:px-8 sm:pb-12 sm:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-reva-secondary transition hover:bg-white/70 hover:text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/carrito">
            <span aria-hidden="true">←</span> Salir de la vista de prueba
          </Link>
          <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-reva-border/80 bg-white/75 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-reva-secondary">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-reva-warning" /> Prototipo · sin transacción
          </span>
        </div>
        <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-reva-brand-strong">Una compra con claridad</p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.04] tracking-tight text-reva-primary sm:text-6xl">Una buena elección merece un buen cierre.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-reva-secondary sm:text-base sm:leading-7">Una sola experiencia para revisar tus prendas, orientar la entrega y entender qué sigue, sin crear una cuenta.</p>
          </div>
          <ol aria-label="Etapas de esta vista de demostración" className="flex max-w-md items-center gap-2 text-xs text-reva-secondary sm:gap-3 lg:pb-1">
            <li aria-current="step" className="flex items-center gap-2 font-semibold text-reva-primary"><span className="grid size-7 place-items-center rounded-full bg-reva-action text-white">1</span><span>Entrega</span></li>
            <li aria-hidden="true" className="h-px min-w-4 flex-1 bg-reva-border" />
            <li className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full border border-reva-border bg-white/70">2</span><span>Factura</span></li>
            <li aria-hidden="true" className="h-px min-w-4 flex-1 bg-reva-border" />
            <li className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full border border-reva-border bg-white/70">3</span><span>Revisión</span></li>
          </ol>
        </div>
      </div>
    </header>

    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-7 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_21.5rem] lg:gap-12">
      <div className="min-w-0">
        <div className="mb-8 rounded-2xl border border-reva-warning/25 bg-[#faf6ed] px-4 py-3.5 sm:flex sm:items-center sm:gap-3 sm:px-5">
          <span aria-hidden="true" className="mb-1 inline-grid size-6 place-items-center rounded-full border border-reva-warning/40 text-xs text-reva-warning sm:mb-0">i</span>
          <p className="text-xs leading-5 text-reva-secondary"><strong className="font-semibold text-reva-primary">Solo demostración:</strong> los campos contienen ejemplos ficticios. No escribas información real; nada se envía, guarda ni conecta con un pago.</p>
        </div>

        <fieldset className="mb-9 border-0 p-0">
          <legend className="text-[0.66rem] font-semibold uppercase tracking-[0.17em] text-reva-secondary">Probar los dos puntos de entrada</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-[#e8edeb] p-1.5 sm:inline-grid sm:min-w-[26rem]">
            <button aria-pressed={entry === "cart"} className={`min-h-12 rounded-xl px-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus ${entry === "cart" ? "bg-white font-semibold text-reva-primary shadow-sm" : "text-reva-secondary hover:text-reva-primary"}`} onClick={() => setEntry("cart")} type="button">Desde carrito <span className="text-xs">· 2 prendas demo</span></button>
            <button aria-pressed={entry === "product"} className={`min-h-12 rounded-xl px-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus ${entry === "product" ? "bg-white font-semibold text-reva-primary shadow-sm" : "text-reva-secondary hover:text-reva-primary"}`} onClick={() => setEntry("product")} type="button">Desde producto <span className="text-xs">· 1 prenda demo</span></button>
          </div>
        </fieldset>

        <form autoComplete="off" onSubmit={showReview}>
          <section aria-labelledby="delivery-heading" className="border-b border-reva-border/80 pb-8 sm:pb-10">
            <SectionMarker headingId="delivery-heading" number="01" eyebrow="Un contacto y una dirección" title="¿Dónde te encontramos?" />
            <p className="ml-0 mt-3 text-xs text-reva-secondary sm:ml-14">El asterisco representa validación de esta maqueta, no un requisito definitivo de REVA.</p>
            <div className="ml-0 mt-6 grid gap-x-4 gap-y-5 sm:ml-14 sm:grid-cols-2">
              <label className={labelClass}>Nombre de demostración <span className="text-reva-danger">*</span>
                <input className={fieldClass} onChange={(event) => updateContact("name", event.target.value)} required value={contact.name} />
              </label>
              <label className={labelClass}>Correo de ejemplo <span className="text-reva-danger">*</span>
                <input className={fieldClass} onChange={(event) => updateContact("email", event.target.value)} required type="email" value={contact.email} />
              </label>
              <label className={labelClass}>Teléfono ficticio <span className="text-reva-danger">*</span>
                <input className={fieldClass} inputMode="tel" onChange={(event) => updateContact("phone", event.target.value)} required type="tel" value={contact.phone} />
              </label>
              <div className="flex min-h-[4.8rem] flex-col justify-center rounded-xl border border-reva-border/70 bg-white/55 px-4 py-3">
                <span className="text-xs uppercase tracking-[0.12em] text-reva-secondary">Departamento</span>
                <span className="mt-1 font-medium">Guatemala <span className="ml-1 text-xs font-normal text-reva-secondary">· fijo en este prototipo</span></span>
              </div>
              <label className={labelClass}>Municipio <span className="text-reva-danger">*</span>
                <select className={fieldClass} onChange={(event) => { setMunicipalityCode(event.target.value as GuatemalaMunicipalityCode); setZone(""); setReviewReady(false); }} required value={municipalityCode}>
                  {GUATEMALA_MUNICIPALITIES.map((item) => <option key={item.code} value={item.code}>{item.name} · {item.code}</option>)}
                </select>
              </label>

              <label className={labelClass}>
                Zona o sector <span className="font-normal text-reva-secondary">(opcional)</span>
                {zoneCatalog ? <select className={fieldClass} onChange={(event) => { setZone(event.target.value); setReviewReady(false); }} value={zone}>
                  <option value="">Selecciona una zona, si aplica</option>
                  {zoneCatalog.zones.map((number) => <option key={number} value={`Zona ${number}`}>Zona {number}</option>)}
                </select> : <input className={fieldClass} onChange={(event) => { setZone(event.target.value); setReviewReady(false); }} placeholder="Zona, colonia o sector, si aplica" value={zone} />}
                <span aria-atomic="true" aria-live="polite" className="mt-1.5 block text-xs font-normal leading-5 text-reva-secondary">{zoneCatalog ? <>Catálogo textual de referencia según {zoneCatalog.sourceLabel}; no representa límites ni confirma cobertura.</> : `No hay un catálogo municipal verificado en este prototipo para ${municipality?.name ?? "este municipio"}. Indica la zona o sector solo si aplica; esto no limita la entrega.`}</span>
              </label>

              <div aria-live="polite" className="relative overflow-hidden rounded-2xl border border-reva-border bg-white p-4 sm:col-span-2 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-5">
                <div aria-hidden="true" className="pointer-events-none absolute -right-5 -top-12 size-36 rounded-full border border-reva-brand-strong/10 sm:size-44" />
                <div className="relative flex items-center gap-4">
                  <div aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-[#e9efed] font-serif text-sm text-reva-brand-strong shadow-[inset_0_0_0_7px_rgba(255,255,255,0.75)]">GT</div>
                  <div className="min-w-0">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-reva-secondary">Vista de selección · no es mapa</p>
                    <p className="mt-1 truncate font-serif text-xl text-reva-primary">{municipality?.name ?? "Municipio no reconocido"}{zone ? ` · ${zone}` : ""}</p>
                  </div>
                </div>
                <p className="relative mt-3 max-w-sm text-xs leading-5 text-reva-secondary sm:mt-0 sm:text-right">{municipality ? `Municipio ${municipality.code}.` : "El código municipal no está reconocido."} Esta ficha refleja el texto elegido; no representa ubicación ni límites geográficos y no confirma cobertura de entrega.</p>
              </div>

              <label className={labelClass}>Dirección ficticia <span className="text-reva-danger">*</span>
                <input className={fieldClass} onChange={(event) => updateContact("address", event.target.value)} required value={contact.address} />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>Casa, apartamento o referencia <span className="font-normal text-reva-secondary">(opcional)</span>
                <input className={fieldClass} onChange={(event) => updateContact("complement", event.target.value)} value={contact.complement} />
              </label>
            </div>
            <p className="ml-0 mt-5 rounded-xl bg-[#f3f4f1] px-4 py-3 text-xs leading-5 text-reva-secondary sm:ml-14">La cobertura real aún debe confirmarse con la operación de entrega. Elegir cualquiera de estos municipios en esta demostración no implica servicio disponible.</p>
          </section>

          <section aria-labelledby="billing-heading" className="relative isolate border-b border-reva-border/80 py-8 sm:py-10">
            <div aria-hidden="true" className="pointer-events-none absolute -right-14 top-16 -z-10 size-52 rounded-full border border-reva-brand-strong/10 sm:right-0 sm:size-64" />
            <SectionMarker headingId="billing-heading" number="02" eyebrow="Solo como concepto" title="¿Necesitas datos de factura?" />
            <div className="relative ml-0 mt-5 overflow-hidden rounded-2xl border border-reva-border/80 bg-white/90 p-4 sm:ml-14 sm:p-5">
              <fieldset className="border-0 p-0">
                <legend className="text-sm font-semibold text-reva-primary">Elige una opción de facturación · demostración</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors motion-reduce:transition-none ${billing.type === "cf" ? "border-reva-brand-strong/50 bg-[#edf2ef] text-reva-primary" : "border-reva-border bg-white text-reva-secondary hover:border-reva-brand-strong/30"}`}>
                    <input checked={billing.type === "cf"} className="size-4 accent-[#294b58] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-reva-focus" name="billing-type" onChange={() => updateBillingType("cf")} type="radio" />
                    <span>Consumidor Final (CF)</span>
                  </label>
                  <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors motion-reduce:transition-none ${billing.type === "nit" ? "border-reva-brand-strong/50 bg-[#edf2ef] text-reva-primary" : "border-reva-border bg-white text-reva-secondary hover:border-reva-brand-strong/30"}`}>
                    <input checked={billing.type === "nit"} className="size-4 accent-[#294b58] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-reva-focus" name="billing-type" onChange={() => updateBillingType("nit")} type="radio" />
                    <span>Factura con NIT</span>
                  </label>
                </div>
              </fieldset>
              {billing.type === "cf" ? <p className="mt-4 rounded-xl border-l-2 border-reva-brand-strong/45 bg-[#f7f8f5] px-4 py-3 text-xs leading-5 text-reva-secondary" role="status">Consumidor Final (CF) seleccionado. No se solicita NIT en esta demostración. Esto no confirma que CF sea aplicable en todas las transacciones.</p> : <div className="mt-4 border-t border-reva-border/70 pt-4">
                <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                  <label className={labelClass} htmlFor="demo-recipient-name">Nombre a facturar · solo ejemplo
                    <input autoComplete="off" className={fieldClass} id="demo-recipient-name" onChange={(event) => { setBilling((current) => updateBillingDemoRecipientName(current, event.target.value)); setReviewReady(false); }} placeholder="Escribe un nombre ficticio" value={billing.recipientName} />
                  </label>
                  <label className={labelClass} htmlFor="demo-nit">NIT · solo ejemplo
                    <input autoComplete="off" className={fieldClass} id="demo-nit" onChange={(event) => { setBilling((current) => updateBillingDemoNit(current, event.target.value)); setReviewReady(false); }} placeholder="Ej. NIT-DEMO" value={billing.nit} />
                  </label>
                </div>
                <p className="mt-3 border-l-2 border-reva-brand-strong/35 pl-3 text-xs leading-5 text-reva-secondary">Usa información ficticia, no datos reales. No hay validación ni almacenamiento; la aplicabilidad y los requisitos requieren revisión fiscal calificada en Guatemala.</p>
              </div>}
            </div>
          </section>

          <section aria-labelledby="review-section-heading" className="pt-8 sm:pt-10">
            <SectionMarker headingId="review-section-heading" number="03" eyebrow="Antes de cualquier decisión" title="Revisa lo que verías" />
            <div className="ml-0 mt-5 sm:ml-14">
              <p className="max-w-2xl text-sm leading-6 text-reva-secondary">El resumen usa solo ejemplos locales. En una futura experiencia, aquí podrías corregir tus datos y confirmar disponibilidad, costo de entrega y total antes de elegir cómo continuar.</p>
              {!reviewReady ? <button className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-reva-action px-6 text-sm font-semibold text-reva-on-action shadow-[0_12px_30px_-18px_rgba(32,53,61,0.7)] transition hover:-translate-y-0.5 hover:bg-reva-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2 sm:w-auto" type="submit">Ver revisión de demostración <span aria-hidden="true">→</span></button> : <div className="mt-5 rounded-2xl border border-reva-brand-strong/20 bg-[#eef2f0] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-reva-brand-strong">Vista previa · sin confirmar compra</p><h3 className="mt-1 font-serif text-xl text-reva-primary" ref={reviewHeading} tabIndex={-1}>Tu revisión de muestra</h3></div>
                  <button className="min-h-10 rounded-full px-3 text-sm font-medium text-reva-brand-strong underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" onClick={() => setReviewReady(false)} type="button">Editar información</button>
                </div>
                <dl className="mt-4 grid gap-3 border-t border-reva-border/80 pt-4 text-sm sm:grid-cols-2">
                  <div><dt className="text-xs text-reva-secondary">Contacto de muestra</dt><dd className="mt-1 font-medium">{contact.name} · {contact.email}</dd></div>
                  <div><dt className="text-xs text-reva-secondary">Entrega de muestra</dt><dd className="mt-1 font-medium">{municipality?.name ?? "Municipio no reconocido"}{zone ? ` · ${zone}` : ""}{contact.address ? ` · ${contact.address}` : ""}{contact.complement ? ` · ${contact.complement}` : ""}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-xs text-reva-secondary">Facturación de ejemplo</dt><dd className="mt-1 font-medium">{billing.type === "cf" ? "Consumidor Final (CF) · sin NIT" : <>Factura con NIT{billing.recipientName ? ` · ${billing.recipientName}` : ""} · {billing.nit || "NIT-DEMO"}</>}</dd></div>
                </dl>
                <p aria-live="polite" className="mt-4 border-t border-reva-border/80 pt-4 text-xs leading-5 text-reva-secondary">No se creó una orden, reserva, cotización de envío, factura ni pago.</p>
              </div>}
              <div className="mt-6 flex gap-3 border-l-2 border-reva-brand-strong/35 pl-4">
                <span aria-hidden="true" className="mt-0.5 font-serif text-lg text-reva-brand-strong">↗</span>
                <p className="max-w-xl text-xs leading-5 text-reva-secondary"><strong className="font-semibold text-reva-primary">Más adelante:</strong> el paso de pago necesitaría una opción confirmada por REVA. Si se usa un proveedor, la información de tarjeta se ingresaría en su página alojada; aquí no hay integración ni se inicia pago.</p>
              </div>
              <p className="mt-5 text-center text-[0.68rem] font-medium text-reva-secondary">Esta demostración no crea órdenes, reservas, facturas ni pagos, y no guarda tus cambios.</p>
            </div>
          </section>
        </form>
      </div>

      <aside aria-labelledby="summary-heading" className="h-fit lg:sticky lg:top-6">
        <div className="overflow-hidden rounded-[1.5rem] border border-reva-border bg-white shadow-[0_24px_70px_-48px_rgba(32,53,61,0.55)]">
          <div className="relative isolate flex items-start justify-between gap-4 overflow-hidden bg-[#eaf0ee] px-5 py-5 sm:px-6">
            <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-14 -z-10 size-40 rounded-full border border-reva-brand-strong/10" />
            <div><p className="text-[0.64rem] font-semibold uppercase tracking-[0.17em] text-reva-brand-strong">Selección de ejemplo</p><h2 className="mt-1 font-serif text-2xl text-reva-primary" id="summary-heading">Tus prendas</h2></div>
            <span className="grid size-10 place-items-center rounded-full border border-white/80 bg-white/75 font-serif text-sm text-reva-brand-strong">0{products.length}</span>
          </div>
          <ul className="divide-y divide-reva-border/70 px-5 sm:px-6">
            {products.map((product, index) => <li className="flex gap-3 py-4" key={`${entry}-${product.title}`}>
              {product.image ? <div className="relative aspect-[4/5] w-[4.25rem] shrink-0 overflow-hidden rounded-lg bg-[#dff4fb]"><Image alt="Ilustración de referencia de una chaqueta; no representa inventario real" className="object-cover" fill sizes="68px" src={denimImage} /></div> : <div aria-hidden="true" className="relative grid aspect-[4/5] w-[4.25rem] shrink-0 place-items-center overflow-hidden rounded-lg bg-[#eee6e2]"><span className="absolute -right-2 -top-2 size-12 rounded-full border border-[#78434b]/20"/><span className="font-serif text-lg text-[#78434b]">R</span></div>}
              <div className="min-w-0 flex-1 self-center"><p className="text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-reva-secondary">Pieza única · muestra {index + 1}</p><h3 className="mt-1 font-serif text-base leading-snug text-reva-primary">{product.title}</h3><p className="mt-1 text-xs text-reva-secondary">{product.detail}</p><p className="mt-2 text-sm font-semibold tabular-nums">{product.price}</p></div>
            </li>)}
          </ul>
          {entry === "product" ? <div className="border-t border-reva-border/70 px-5 py-3 sm:px-6">
            <Link className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-reva-brand-strong underline decoration-reva-brand-strong/35 underline-offset-4 transition-colors hover:text-reva-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus motion-reduce:transition-none" href="/catalogo">Descubrir más prendas <span aria-hidden="true">→</span></Link>
          </div> : null}
          <div className="border-t border-reva-border bg-[#fbfbf9] px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-4"><span className="text-sm text-reva-secondary">Subtotal de ejemplo</span><span className="font-serif text-xl tabular-nums text-reva-primary">{subtotal}</span></div>
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-reva-border/70 pt-4"><span className="text-sm text-reva-secondary">Entrega</span><span className="text-right text-xs text-reva-secondary">Por definir</span></div>
            <p className="mt-4 rounded-xl bg-[#f5f2ee] px-3.5 py-3 text-xs leading-5 text-reva-secondary">Las prendas, imágenes y precios son ficticios. No representan inventario, disponibilidad ni precio de REVA.</p>
            <p className="mt-4 text-center text-[0.66rem] uppercase tracking-[0.12em] text-reva-secondary">Estimación ilustrativa <span className="mx-1">·</span><strong className="font-semibold text-reva-primary">{subtotal} + entrega por definir</strong></p>
          </div>
        </div>
        <p className="mt-4 px-1 text-xs leading-5 text-reva-secondary">El carrito real conserva su flujo actual de consulta por WhatsApp. Este prototipo no se conecta con él.</p>
      </aside>
    </div>
  </main>;
}
