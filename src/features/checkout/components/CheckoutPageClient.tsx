"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { cartSubtotal } from "@/features/cart/cart-total";
import { createCheckoutWhatsAppUrl } from "@/features/checkout/server/checkout.actions";
import { getCheckoutProgress } from "@/features/checkout/checkout-progress";
import { formatCheckoutContactName, validateCheckoutDelivery, type CheckoutDeliveryErrors, type CheckoutDeliveryField } from "@/features/checkout/checkout-validation";
import { GUATEMALA_MUNICIPALITIES, findGuatemalaMunicipality, getVerifiedZoneCatalog, type GuatemalaMunicipalityCode } from "@/features/checkout-prototype/municipalities";
import type { CheckoutResolvedItem } from "@/features/checkout/checkout.types";
import { INITIAL_BILLING_DEMO, selectBillingDemoType, updateBillingDemoNit, updateBillingDemoRecipientName, type BillingDemoType } from "@/features/checkout-prototype/billing-demo";

type CheckoutEntry = "cart" | "product";
type ContactDetails = Readonly<{
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  neighborhood: string;
  street: string;
  houseNumber: string;
  apartment: string;
  reference: string;
}>;

const EMPTY_CONTACT: ContactDetails = { firstName: "", lastName: "", email: "", phone: "", neighborhood: "", street: "", houseNumber: "", apartment: "", reference: "" };
const fieldBaseClass = "mt-2 min-h-12 w-full rounded-xl border border-[#aebcbd] px-3.5 text-sm text-reva-primary shadow-sm outline-none transition-[border-color,box-shadow,background-color] placeholder:text-reva-secondary/80 focus:border-reva-action focus:ring-2 focus:ring-reva-focus/30 motion-reduce:transition-none";
const fieldClass = `${fieldBaseClass} bg-white`;
const geographicFieldClass = `${fieldBaseClass} border-[#9eafb8] bg-[#e8eff2]`;
const invalidFieldClass = "border-reva-danger focus:border-reva-danger focus:ring-reva-danger/20";
const labelClass = "block text-sm font-semibold text-reva-primary";
const requiredLabel = <span className="font-normal text-reva-secondary">(obligatorio)</span>;

function SectionMarker({ number, eyebrow, headingId, title }: Readonly<{ number: string; eyebrow: string; headingId: string; title: string }>) {
  return <div className="flex gap-4 sm:gap-5">
    <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full border border-reva-border bg-white font-serif text-lg text-reva-brand-strong shadow-sm">{number}</span>
    <div className="min-w-0">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-reva-secondary">{eyebrow}</p>
      <h2 className="mt-1 font-serif text-2xl leading-tight text-reva-primary sm:text-[1.8rem]" id={headingId}>{title}</h2>
    </div>
  </div>;
}

function updateContactValue(current: ContactDetails, field: keyof ContactDetails, value: string): ContactDetails {
  return { ...current, [field]: value };
}

export function CheckoutPageClient({ canContactOnWhatsApp, entry, initialItems, initialReadError, requestedSlugs, selectionIssue }: Readonly<{
  canContactOnWhatsApp: boolean;
  entry: CheckoutEntry;
  initialItems: readonly CheckoutResolvedItem[];
  initialReadError: boolean;
  requestedSlugs: readonly string[];
  selectionIssue: "empty" | "invalid" | null;
}>) {
  const [items, setItems] = useState(initialItems);
  const [contact, setContact] = useState(EMPTY_CONTACT);
  const [municipalityCode, setMunicipalityCode] = useState<GuatemalaMunicipalityCode>("0101");
  const [zone, setZone] = useState("");
  const [billing, setBilling] = useState(INITIAL_BILLING_DEMO);
  const [reviewReady, setReviewReady] = useState(false);
  const [validationErrors, setValidationErrors] = useState<CheckoutDeliveryErrors>({});
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState(initialReadError ? "No pudimos verificar tu selección. Intenta actualizarla antes de continuar." : "");
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  const deliveryFieldRefs = useRef<Partial<Record<CheckoutDeliveryField, HTMLInputElement | HTMLSelectElement | null>>>({});
  const municipality = findGuatemalaMunicipality(municipalityCode);
  const zoneCatalog = getVerifiedZoneCatalog(municipalityCode);
  const products = useMemo(() => items.flatMap(({ product }) => product ? [product] : []), [items]);
  const unavailable = items.length !== requestedSlugs.length || items.some(({ product }) => !product);
  const subtotal = cartSubtotal(products.map(({ price }) => price));
  const currentSlugs = items.map(({ slug }) => slug);
  const progress = getCheckoutProgress(reviewReady);

  useEffect(() => {
    if (reviewReady) reviewHeading.current?.focus();
  }, [reviewReady]);

  function updateContact(field: keyof ContactDetails, value: string) {
    const next = updateContactValue(contact, field, value);
    setContact(next);
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validateCheckoutDelivery({ ...next, municipalityCode }));
    }
    setReviewReady(false);
  }

  function updateMunicipality(code: GuatemalaMunicipalityCode) {
    setMunicipalityCode(code);
    setZone("");
    setReviewReady(false);
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validateCheckoutDelivery({ ...contact, municipalityCode: code }));
    }
  }

  function updateBillingType(type: BillingDemoType) {
    setBilling((current) => selectBillingDemoType(current, type));
    setReviewReady(false);
  }

  function reviewDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReviewReady(true);
  }

  function proceedToPurchase() {
    const errors = validateCheckoutDelivery({ ...contact, municipalityCode });
    setValidationErrors(errors);
    const firstInvalidField = Object.keys(errors)[0] as CheckoutDeliveryField | undefined;
    if (firstInvalidField) {
      deliveryFieldRefs.current[firstInvalidField]?.focus();
      return;
    }
    void continueToWhatsApp();
  }

  async function continueToWhatsApp() {
    if (pending || unavailable || currentSlugs.length === 0 || !canContactOnWhatsApp) return;
    setPending(true);
    setNotice("");
    try {
      const expected = products.map(({ slug, price }) => ({ slug, price }));
      const result = await createCheckoutWhatsAppUrl(currentSlugs, expected);
      if (result.status === "changed") {
        setItems(result.items);
        setReviewReady(false);
        setNotice("El precio cambió desde la última revisión. Revisa el resumen actualizado antes de continuar.");
        return;
      }
      if (result.status === "unavailable") {
        setItems(result.items);
        setReviewReady(false);
        setNotice("La disponibilidad cambió o no pudimos verificar una prenda. No continuaremos con una selección sin verificar.");
        return;
      }
      if (result.status !== "ready" || !result.url) {
        setNotice("No pudimos preparar la consulta por WhatsApp. Intenta de nuevo o revisa los canales de contacto.");
        return;
      }
      window.location.assign(result.url);
    } catch {
      setNotice("No pudimos verificar los Productos ahora. Intenta de nuevo.");
    } finally {
      setPending(false);
    }
  }

  const returnHref = entry === "cart" ? "/carrito" : products[0] ? `/productos/${encodeURIComponent(products[0].slug)}` : "/catalogo";

  if (requestedSlugs.length === 0) {
    return <main className="min-h-[70vh] bg-reva-background px-4 py-16 text-reva-primary sm:px-8">
      <section className="mx-auto max-w-3xl border-l-2 border-reva-brand-strong pl-5 sm:pl-8">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-reva-brand-strong">Checkout · consulta, no transacción</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">{selectionIssue === "invalid" ? "No pudimos reconocer tu selección." : "Tu selección empieza con una prenda."}</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-reva-secondary">{selectionIssue === "invalid" ? "Vuelve al carrito o al catálogo y abre Checkout desde una prenda disponible. No se enviaron datos personales." : "Agrega una prenda desde su página o revisa primero tu carrito. Aún no se crean órdenes, reservas ni pagos en el sitio."}</p>
        <Button className="mt-7" href={selectionIssue === "invalid" ? "/catalogo" : entry === "product" ? "/catalogo" : "/carrito"} variant="solid">{selectionIssue === "invalid" || entry === "product" ? "Explorar el catálogo" : "Ir al carrito"}</Button>
      </section>
    </main>;
  }

  return <main className="checkout-atmosphere relative isolate min-h-screen bg-reva-background pb-16 text-reva-primary" id="main-content">
    <div className="relative z-10">
    <header className="relative overflow-hidden border-b border-[#d3dcdd] bg-[radial-gradient(ellipse_at_78%_14%,rgba(61,90,102,0.12),transparent_42%),linear-gradient(135deg,#f8faf9_0%,#eef3f3_62%,#f5f7f5_100%)]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-28 size-80 rounded-full border border-reva-brand-strong/10 sm:right-[8%] sm:size-[28rem]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-7 sm:px-8 sm:pb-12 sm:pt-10">
        <Link className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-reva-secondary transition hover:bg-white/70 hover:text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href={returnHref}><span aria-hidden="true">←</span> Volver</Link>
        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-reva-brand-strong">Una compra con claridad</p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.04] tracking-tight text-reva-primary sm:text-6xl">Una buena elección merece un buen cierre.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-reva-secondary sm:text-base sm:leading-7">Revisa las prendas y los datos que podrían orientar la entrega. Antes de aceptar una compra, REVA debe confirmar disponibilidad, cobertura y cualquier costo aplicable.</p>
          </div>
          <ol aria-label="Progreso de compra" className="grid w-full max-w-xl grid-cols-4 text-center text-[0.65rem] text-reva-secondary sm:text-xs lg:pb-1">
            {progress.map((step, index) => <li aria-current={step.status === "current" ? "step" : undefined} aria-label={`${step.label}, paso ${index + 1} de 4${step.status === "current" ? ", actual" : step.status === "complete" ? ", revisado" : ", próximo"}`} className="relative flex min-w-0 flex-col items-center gap-1.5" key={step.label}>
              {index < progress.length - 1 ? <span aria-hidden="true" className={`absolute left-1/2 top-3.5 h-px w-full ${step.status === "complete" ? "bg-reva-brand-strong" : "bg-[#bccbd0]"}`} /> : null}
              <span className={`relative grid size-7 place-items-center rounded-full border text-xs font-semibold transition-colors motion-reduce:transition-none ${step.status === "current" ? "border-reva-action bg-reva-action text-reva-on-action" : step.status === "complete" ? "border-reva-brand-strong bg-reva-brand-strong text-reva-on-brand" : "border-[#afbec3] bg-[#f8faf9] text-reva-secondary"}`}>{index + 1}</span>
              <span className={`relative max-w-full px-0.5 leading-tight ${step.status === "current" ? "font-semibold text-reva-primary" : ""}`}>{step.label}</span>
            </li>)}
          </ol>
        </div>
      </div>
    </header>

    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-7 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_21.5rem] lg:gap-12">
      <div className="min-w-0">
        <div className="mb-8 rounded-2xl border border-reva-warning/25 bg-[#faf6ed] px-4 py-3.5 sm:flex sm:items-center sm:gap-3 sm:px-5">
          <span aria-hidden="true" className="mb-1 inline-grid size-6 shrink-0 place-items-center rounded-full border border-reva-warning/40 text-xs text-reva-warning sm:mb-0">i</span>
          <p className="text-xs leading-5 text-reva-secondary"><strong className="font-semibold text-reva-primary">Privacidad:</strong> los datos de contacto, entrega y facturación permanecen en este navegador; no se guardan ni se envían a REVA. La consulta de WhatsApp incluye datos públicos de las prendas, subtotal y una pregunta sobre disponibilidad y entrega; no agregues datos personales. Consulta <Link className="font-semibold text-reva-brand-strong underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/terminos">Términos</Link> y <Link className="font-semibold text-reva-brand-strong underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/privacidad">Privacidad</Link>.</p>
        </div>

        {notice ? <p aria-live="polite" className="mb-6 rounded-xl border-l-2 border-reva-warning bg-[#faf6ed] px-4 py-3 text-sm leading-6 text-reva-secondary">{notice}</p> : null}
        {unavailable ? <div className="mb-6 rounded-xl border border-reva-danger/25 bg-white p-4" role="alert"><p className="font-semibold text-reva-primary">Hay prendas que no pudimos verificar.</p><p className="mt-1 text-sm leading-6 text-reva-secondary">No continuaremos con una selección que incluya prendas no disponibles o sin imagen pública. Vuelve a revisar tu carrito.</p><Link className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-reva-brand-strong underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/carrito">Revisar carrito</Link></div> : null}

        <form autoComplete="off" noValidate onSubmit={reviewDetails}>
          <section aria-labelledby="delivery-heading" className="rounded-[1.75rem] bg-[#f7f6f2] px-4 py-6 sm:px-7 sm:py-8">
            <SectionMarker headingId="delivery-heading" number="01" eyebrow="Datos para revisar" title="¿Dónde te encontramos?" />
            {Object.keys(validationErrors).length > 0 ? <p className="mt-4 rounded-xl border-l-2 border-reva-danger bg-white px-4 py-3 text-sm text-reva-danger" role="alert">Completa los campos obligatorios indicados para continuar.</p> : null}
            <div className="mt-6 grid gap-x-4 gap-y-5 sm:ml-14 sm:grid-cols-2">
              <div className="grid min-w-0 grid-cols-1 gap-3 min-[480px]:grid-cols-2">
                <label className={`${labelClass} min-w-0`} htmlFor="checkout-contact-first-name">Nombre {requiredLabel}<input aria-describedby={validationErrors.firstName ? "checkout-first-name-error" : undefined} aria-invalid={Boolean(validationErrors.firstName)} autoComplete="given-name" className={`${fieldClass} ${validationErrors.firstName ? invalidFieldClass : ""}`} id="checkout-contact-first-name" ref={(element) => { deliveryFieldRefs.current.firstName = element; }} onChange={(event) => updateContact("firstName", event.target.value)} placeholder="Nombre" required value={contact.firstName} />{validationErrors.firstName ? <span className="mt-1.5 block text-xs font-medium text-reva-danger" id="checkout-first-name-error">{validationErrors.firstName}</span> : null}</label>
                <label className={`${labelClass} min-w-0`} htmlFor="checkout-contact-last-name">Apellido {requiredLabel}<input aria-describedby={validationErrors.lastName ? "checkout-last-name-error" : undefined} aria-invalid={Boolean(validationErrors.lastName)} autoComplete="family-name" className={`${fieldClass} ${validationErrors.lastName ? invalidFieldClass : ""}`} id="checkout-contact-last-name" ref={(element) => { deliveryFieldRefs.current.lastName = element; }} onChange={(event) => updateContact("lastName", event.target.value)} placeholder="Apellido" required value={contact.lastName} />{validationErrors.lastName ? <span className="mt-1.5 block text-xs font-medium text-reva-danger" id="checkout-last-name-error">{validationErrors.lastName}</span> : null}</label>
              </div>
              <label className={labelClass} htmlFor="checkout-contact-phone">Teléfono de contacto {requiredLabel}<input aria-describedby={validationErrors.phone ? "checkout-phone-error" : undefined} aria-invalid={Boolean(validationErrors.phone)} autoComplete="off" className={`${fieldClass} ${validationErrors.phone ? invalidFieldClass : ""}`} id="checkout-contact-phone" inputMode="tel" ref={(element) => { deliveryFieldRefs.current.phone = element; }} onChange={(event) => updateContact("phone", event.target.value)} placeholder="Teléfono" required type="tel" value={contact.phone} />{validationErrors.phone ? <span className="mt-1.5 block text-xs font-medium text-reva-danger" id="checkout-phone-error">{validationErrors.phone}</span> : null}</label>
              <label className={labelClass}>Correo electrónico <span className="font-normal text-reva-secondary">(opcional)</span><input autoComplete="off" className={fieldClass} onChange={(event) => updateContact("email", event.target.value)} placeholder="Correo" type="email" value={contact.email} /></label>
              <div className="flex min-h-[4.8rem] flex-col justify-center rounded-xl border border-reva-border/70 bg-white/75 px-4 py-3"><span className="text-xs uppercase tracking-[0.12em] text-reva-secondary">Departamento</span><span className="mt-1 font-medium">Guatemala <span className="ml-1 text-xs font-normal text-reva-secondary">· alcance actual de REVA</span></span></div>
              <label className={labelClass} htmlFor="checkout-municipality">Municipio {requiredLabel}<select aria-describedby={validationErrors.municipalityCode ? "checkout-municipality-error" : undefined} aria-invalid={Boolean(validationErrors.municipalityCode)} aria-required="true" className={`${geographicFieldClass} ${validationErrors.municipalityCode ? invalidFieldClass : ""}`} id="checkout-municipality" onChange={(event) => updateMunicipality(event.target.value as GuatemalaMunicipalityCode)} ref={(element) => { deliveryFieldRefs.current.municipalityCode = element; }} required value={municipalityCode}><option value="">Selecciona un municipio</option>{GUATEMALA_MUNICIPALITIES.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select>{validationErrors.municipalityCode ? <span className="mt-1.5 block text-xs font-medium text-reva-danger" id="checkout-municipality-error">{validationErrors.municipalityCode}</span> : null}</label>
              <label className={labelClass}>Zona o sector <span className="font-normal text-reva-secondary">(opcional)</span>{zoneCatalog ? <select className={geographicFieldClass} onChange={(event) => { setZone(event.target.value); setReviewReady(false); }} value={zone}><option value="">Selecciona una zona, si aplica</option>{zoneCatalog.zones.map((number) => <option key={number} value={`Zona ${number}`}>Zona {number}</option>)}</select> : <input className={fieldClass} onChange={(event) => { setZone(event.target.value); setReviewReady(false); }} placeholder="Zona o sector, si aplica" value={zone} />}<span className="mt-1.5 block text-xs font-normal leading-5 text-reva-secondary">Puedes dejarlo vacío si no lo conoces.</span></label>
              <label className={labelClass}>Colonia o residencial <span className="font-normal text-reva-secondary">(opcional)</span><input className={fieldClass} onChange={(event) => updateContact("neighborhood", event.target.value)} placeholder="Colonia o residencial" value={contact.neighborhood} /></label>
              <label className={labelClass} htmlFor="checkout-street">Calle o avenida {requiredLabel}<input aria-describedby={validationErrors.street ? "checkout-street-error" : undefined} aria-invalid={Boolean(validationErrors.street)} autoComplete="off" className={`${fieldClass} ${validationErrors.street ? invalidFieldClass : ""}`} id="checkout-street" ref={(element) => { deliveryFieldRefs.current.street = element; }} onChange={(event) => updateContact("street", event.target.value)} placeholder="Calle o avenida" required value={contact.street} />{validationErrors.street ? <span className="mt-1.5 block text-xs font-medium text-reva-danger" id="checkout-street-error">{validationErrors.street}</span> : null}</label>
              <label className={labelClass} htmlFor="checkout-house-number">Casa o lote {requiredLabel}<input aria-describedby={validationErrors.houseNumber ? "checkout-house-error" : undefined} aria-invalid={Boolean(validationErrors.houseNumber)} autoComplete="off" className={`${fieldClass} ${validationErrors.houseNumber ? invalidFieldClass : ""}`} id="checkout-house-number" ref={(element) => { deliveryFieldRefs.current.houseNumber = element; }} onChange={(event) => updateContact("houseNumber", event.target.value)} placeholder="Número de casa o lote" required value={contact.houseNumber} />{validationErrors.houseNumber ? <span className="mt-1.5 block text-xs font-medium text-reva-danger" id="checkout-house-error">{validationErrors.houseNumber}</span> : null}</label>
              <label className={labelClass}>Apartamento o edificio <span className="font-normal text-reva-secondary">(opcional)</span><input className={fieldClass} onChange={(event) => updateContact("apartment", event.target.value)} placeholder="Apartamento o edificio" value={contact.apartment} /></label>
              <label className={`${labelClass} sm:col-span-2`}>Referencia de entrega <span className="font-normal text-reva-secondary">(opcional)</span><input className={fieldClass} onChange={(event) => updateContact("reference", event.target.value)} placeholder="Referencia adicional" value={contact.reference} /></label>
            </div>
            <p className="mt-5 rounded-xl bg-[#f3f4f1] px-4 py-3 text-xs leading-5 text-reva-secondary sm:ml-14">Los costos, la cobertura y cualquier fecha de entrega se confirmarán con REVA antes de aceptar la compra. No se muestra una tarifa ni un plazo estimado.</p>
          </section>

          <section aria-labelledby="billing-heading" className="relative isolate overflow-hidden border-b border-reva-border/80 py-8 sm:py-10">
            <div aria-hidden="true" className="pointer-events-none absolute -right-14 top-16 -z-10 size-52 rounded-full border border-reva-brand-strong/10 sm:right-0 sm:size-64" />
            <SectionMarker headingId="billing-heading" number="02" eyebrow="Identificación ilustrativa" title="¿Necesitas datos de factura?" />
            <div className="relative mt-5 rounded-2xl border border-[#c3d0d4] bg-[linear-gradient(135deg,rgba(226,237,240,0.88),rgba(255,255,255,0.96)_65%)] p-4 sm:ml-14 sm:p-5">
              <fieldset className="border-0 p-0"><legend className="text-sm font-semibold text-reva-primary">Elige una opción de facturación · aún no se emite una factura</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(["cf", "nit"] as const).map((type) => <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors motion-reduce:transition-none ${billing.type === type ? "border-reva-brand-strong/50 bg-white font-medium text-reva-primary shadow-sm" : "border-reva-border bg-white/65 text-reva-secondary hover:border-reva-brand-strong/30"}`} key={type}><input checked={billing.type === type} className="size-4 accent-[#294b58] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-reva-focus" name="billing-type" onChange={() => updateBillingType(type)} type="radio" /><span>{type === "cf" ? "Consumidor Final (CF)" : "Factura con NIT"}</span></label>)}
                </div>
              </fieldset>
              {billing.type === "cf" ? <p className="mt-4 rounded-xl border-l-2 border-reva-brand-strong/45 bg-white/80 px-4 py-3 text-xs leading-5 text-reva-secondary" role="status">CF seleccionado para esta vista. No se pide NIT. Esto no determina si CF aplica a una transacción futura.</p> : <div className="mt-4 border-t border-reva-border/70 pt-4"><div className="grid gap-x-4 gap-y-4 sm:grid-cols-2"><label className={labelClass} htmlFor="checkout-billing-name">Nombre a facturar <span className="font-normal text-reva-secondary">(solo revisión)</span><input autoComplete="off" className={fieldClass} id="checkout-billing-name" onChange={(event) => { setBilling((current) => updateBillingDemoRecipientName(current, event.target.value)); setReviewReady(false); }} value={billing.recipientName} /></label><label className={labelClass} htmlFor="checkout-billing-nit">NIT <span className="font-normal text-reva-secondary">(solo revisión)</span><input autoComplete="off" className={fieldClass} id="checkout-billing-nit" onChange={(event) => { setBilling((current) => updateBillingDemoNit(current, event.target.value)); setReviewReady(false); }} value={billing.nit} /></label></div></div>}
              <p className="mt-3 border-l-2 border-reva-brand-strong/35 pl-3 text-xs leading-5 text-reva-secondary">No hay validación fiscal ni envío de estos datos. Los criterios de facturación requieren confirmación calificada antes de implementar FEL.</p>
            </div>
          </section>

          <section aria-labelledby="review-section-heading" className="pt-8 sm:pt-10">
            <SectionMarker headingId="review-section-heading" number="03" eyebrow="Antes de hablar con REVA" title="Revisa tu selección" />
            <div className="mt-5 sm:ml-14">
              <p className="max-w-2xl text-sm leading-6 text-reva-secondary">Continuarás por WhatsApp para coordinar disponibilidad, envío y los siguientes pasos. Tu compra no estará confirmada hasta que REVA verifique el pago. Esta consulta no crea una orden ni reserva en el sitio.</p>
              <p className="mt-2 text-xs leading-5 text-reva-secondary">La cobertura y el costo de entrega aún deben confirmarse con REVA.</p>
              {reviewReady ? <div className="mt-5 rounded-2xl border border-reva-brand-strong/20 bg-[#eaf1f3] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-reva-brand-strong">Vista de revisión · no es una orden</p>
                    <h3 className="mt-1 font-serif text-xl text-reva-primary" ref={reviewHeading} tabIndex={-1}>Tus datos en este navegador</h3>
                  </div>
                  <button className="min-h-10 rounded-full px-3 text-sm font-medium text-reva-brand-strong underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" onClick={() => setReviewReady(false)} type="button">Editar datos</button>
                </div>
                <dl className="mt-4 grid gap-3 border-t border-reva-border/80 pt-4 text-sm sm:grid-cols-2">
                  <div><dt className="text-xs text-reva-secondary">Contacto</dt><dd className="mt-1 font-medium">{formatCheckoutContactName(contact.firstName, contact.lastName) || "Sin indicar"}{contact.phone ? ` · ${contact.phone}` : ""}{contact.email ? ` · ${contact.email}` : ""}</dd></div>
                  <div><dt className="text-xs text-reva-secondary">Municipio / zona</dt><dd className="mt-1 font-medium">{municipality?.name ?? "Sin seleccionar"}{zone ? ` · ${zone}` : ""}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-xs text-reva-secondary">Dirección</dt><dd className="mt-1 font-medium">{[contact.neighborhood, contact.street, contact.houseNumber, contact.apartment, contact.reference].filter(Boolean).join(" · ") || "Sin indicar"}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-xs text-reva-secondary">Facturación</dt><dd className="mt-1 font-medium">{billing.type === "cf" ? "Consumidor Final (CF) · sin NIT" : `Factura con NIT${billing.recipientName ? ` · ${billing.recipientName}` : ""}${billing.nit ? ` · ${billing.nit}` : ""}`}</dd></div>
                </dl>
                <p className="mt-4 border-t border-reva-border/80 pt-4 text-xs leading-5 text-reva-secondary">Estos datos se muestran solo para tu revisión; no se transmiten a REVA. El mensaje de WhatsApp incluirá las prendas y sus precios públicos actuales.</p>
              </div> : null}
              <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
                <button className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-reva-brand-strong/30 bg-white px-6 text-sm font-semibold text-reva-primary transition hover:bg-[#eef3f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2 motion-reduce:transition-none sm:w-auto" type="submit">{reviewReady ? "Actualizar revisión" : "Revisar antes de continuar"}</button>
                {canContactOnWhatsApp ? <Button className="w-full sm:w-auto" disabled={pending || unavailable} onClick={proceedToPurchase} variant="solid">{pending ? "Verificando prendas…" : "Proceder a compra"}</Button> : <div><p className="text-sm text-reva-secondary">La consulta por WhatsApp no está disponible ahora.</p><Link className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-reva-brand-strong underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/contacto">Ver canales de contacto</Link></div>}
              </div>
              <p className="mt-5 text-center text-[0.68rem] font-medium text-reva-secondary">Esta consulta no crea orden, reserva, cotización de envío, factura ni pago.</p>
            </div>
          </section>
        </form>
      </div>

      <aside aria-labelledby="summary-heading" className="h-fit lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-[1.5rem] border border-reva-border bg-white shadow-[0_24px_70px_-48px_rgba(32,53,61,0.55)] lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:overscroll-contain">
          <div className="relative isolate flex items-start justify-between gap-4 overflow-hidden bg-[#e5edf1] px-5 py-5 sm:px-6 lg:sticky lg:top-0 lg:z-10"><div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-14 size-40 rounded-full border border-reva-brand-strong/10" /><div><p className="text-[0.64rem] font-semibold uppercase tracking-[0.17em] text-reva-brand-strong">Resumen actual</p><h2 className="mt-1 font-serif text-2xl text-reva-primary" id="summary-heading">Tus prendas</h2></div><span className="grid size-10 place-items-center rounded-full border border-white/80 bg-white/75 font-serif text-sm text-reva-brand-strong">{String(products.length).padStart(2, "0")}</span></div>
          <ul aria-label="Productos de tu selección" className="divide-y divide-reva-border/70 px-5 sm:px-6">{items.map(({ product, slug }) => <li className="flex gap-3 py-4" key={slug}>{product ? <div className="relative aspect-[4/5] w-[4.25rem] shrink-0 overflow-hidden rounded-lg bg-reva-muted"><Image alt={product.image.alt} className="object-cover" fill sizes="68px" src={product.image.src} /></div> : <div aria-hidden="true" className="grid aspect-[4/5] w-[4.25rem] shrink-0 place-items-center rounded-lg bg-[#f5e9e7] text-xs font-semibold text-reva-danger">No disponible</div>}<div className="min-w-0 flex-1 self-center">{product ? <><p className="text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-reva-secondary">Pieza única · {product.condition}</p><h3 className="mt-1 font-serif text-base leading-snug text-reva-primary">{product.title}</h3><p className="mt-1 text-xs text-reva-secondary">{product.sizeLabel ? `Talla ${product.sizeLabel}` : "Talla no indicada"}</p><p className="mt-2 text-sm font-semibold tabular-nums">Q {product.price}</p></> : <><p className="text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-reva-danger">No disponible</p><h3 className="mt-1 break-all text-sm text-reva-primary">No se pudo verificar esta prenda</h3></>}</div></li>)}</ul>
          <div className="border-t border-reva-border bg-[#fbfbf9] px-5 py-5 sm:px-6"><div className="flex items-center justify-between gap-4"><span className="text-sm text-reva-secondary">Subtotal de prendas</span><span className="font-serif text-xl tabular-nums text-reva-primary">{subtotal}</span></div><div className="mt-4 flex items-center justify-between gap-4 border-t border-reva-border/70 pt-4"><span className="text-sm text-reva-secondary">Entrega</span><span className="text-right text-xs text-reva-secondary">Por confirmar con REVA</span></div><p className="mt-4 rounded-xl bg-[#f5f2ee] px-3.5 py-3 text-xs leading-5 text-reva-secondary">El precio es actual según la ficha pública, pero disponibilidad y cualquier costo de entrega se confirman antes de aceptar la compra.</p><p className="mt-4 text-center text-[0.66rem] uppercase tracking-[0.12em] text-reva-secondary">No es un total de pago</p><Button className="mt-5 w-full" disabled={pending || unavailable || !canContactOnWhatsApp} onClick={proceedToPurchase} variant="solid">{pending ? "Verificando prendas…" : "Proceder a compra"}</Button></div>
        </div>
        <p className="mt-4 px-1 text-xs leading-5 text-reva-secondary">La disponibilidad se confirmará antes de continuar.</p>
      </aside>
    </div>
    </div>
  </main>;
}
