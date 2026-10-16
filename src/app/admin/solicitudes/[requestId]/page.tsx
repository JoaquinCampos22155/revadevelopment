import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { requireCurrentAdmin } from "@/features/product-manager/server/admin-access";
import { approvePurchaseRequestAction, discardPurchaseRequestAction } from "@/features/transactions/server/transactional-admin.actions";
import { getPurchaseRequest } from "@/features/transactions/server/transactional-admin.server";
import { findGuatemalaMunicipality } from "@/features/checkout-prototype/municipalities";
import { isLocalTransactionalRequestsEnabled } from "@/features/transactions/server/local-purchase-requests";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Detalle de solicitud | Administración REVA", robots: { follow: false, index: false } };

type Props = Readonly<{ params: Promise<{ requestId: string }> }>;
const inputClass = "min-h-5 accent-reva-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-reva-focus";

export default async function PurchaseRequestDetailPage({ params }: Props) {
  if (!isLocalTransactionalRequestsEnabled()) notFound();
  await requireCurrentAdmin();
  const requestId = (await params).requestId;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) notFound();
  let request;
  try { request = await getPurchaseRequest(requestId); } catch { request = null; }
  if (!request) notFound();
  const municipality = findGuatemalaMunicipality(request.municipalityCode as never);
  const address = [request.delivery.neighborhood, municipality?.name, request.delivery.zone, request.delivery.street, request.delivery.house_number, request.delivery.apartment, request.delivery.reference].filter(Boolean).join(" · ");

  return <main id="main-content"><Section><div className="mx-auto max-w-4xl space-y-8">
    <div><Text variant="label">Gestión · Solicitud temporal</Text><Heading className="mt-2" level={1} variant="editorial">{request.publicReference}</Heading><Text className="mt-3" variant="quiet">Expira el {new Date(request.expiresAt).toLocaleString("es-GT")} · el acceso a este detalle revela datos personales solo a personal administrador autorizado.</Text><Link className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-reva-brand-strong underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/admin/solicitudes">← Solicitudes y órdenes</Link></div>

    <section aria-labelledby="request-items" className="border-y border-slate-200 bg-white px-4 py-5 sm:px-6"><h2 className="text-xl font-semibold" id="request-items">Prendas y revisión</h2><ul className="mt-4 divide-y divide-slate-200">{request.items.map((item) => <li className="grid gap-2 py-3 sm:grid-cols-[1fr_auto]" key={item.sku}><div><p className="font-medium">{item.title}</p><p className="text-sm text-slate-600">SKU {item.sku} · precio solicitado Q {item.price}</p><p className="text-sm text-slate-600">Actual: {item.currentStatus} · Q {item.currentPrice ?? "no disponible"}</p></div><span className="font-medium">Q {item.price}</span></li>)}</ul><p className="mt-4 border-t border-slate-200 pt-4 font-semibold">Subtotal solicitado: Q {request.subtotal}</p></section>

    <section aria-labelledby="request-contact" className="rounded-2xl bg-[#f7f6f2] p-5 sm:p-7"><h2 className="text-xl font-semibold" id="request-contact">Contacto y entrega</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Nombre</dt><dd className="mt-1">{request.contact.first_name} {request.contact.last_name}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Teléfono</dt><dd className="mt-1">{request.contact.phone}</dd></div>{request.contact.email ? <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Correo</dt><dd className="mt-1 break-all">{request.contact.email}</dd></div> : null}<div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Dirección</dt><dd className="mt-1">{address}</dd></div></dl><div className="mt-5 border-t border-slate-300 pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Facturación indicada</p><p className="mt-1">{request.billingType === "cf" ? "Consumidor Final (CF)" : `NIT · ${request.billing.recipient_name || "sin nombre indicado"} · ${request.billing.nit || "sin identificador indicado"}`}</p></div></section>

    <section aria-labelledby="request-access-history" className="border-t border-slate-200 pt-5"><h2 className="text-xl font-semibold" id="request-access-history">Accesos a datos personales</h2><p className="mt-2 text-sm text-slate-600">Se conserva el acceso administrativo mientras la solicitud esté activa; el registro se elimina junto con ella.</p><ol className="mt-3 space-y-2 text-sm text-slate-600">{request.accessEvents.map((event, index) => <li key={`${event.createdAt}-${index}`}>{event.purpose === "request_review" ? "Revisión de solicitud" : event.purpose} · {new Date(event.createdAt).toLocaleString("es-GT")}</li>)}</ol></section>

    <section aria-labelledby="request-actions" className="space-y-4"><h2 className="text-xl font-semibold" id="request-actions">Acciones administrativas</h2><p className="rounded-xl border-l-2 border-amber-600 bg-amber-50 px-4 py-3 text-sm leading-6 text-slate-700">La aprobación crea una orden pendiente de pago y reserva las prendas por 3 horas; no acredita pago. Confirma disponibilidad y vuelve a acordar cualquier precio cambiado antes de aprobar.</p>
      <form action={approvePurchaseRequestAction} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5"><input name="requestId" type="hidden" value={request.id} /><label className="flex gap-3 text-sm leading-6"><input className={inputClass} name="priceReconfirmed" required type="checkbox" value="yes" /><span>Confirmo que verifiqué disponibilidad y que el precio actual fue confirmado con el cliente, incluso si difiere del precio solicitado.</span></label><Button type="submit" variant="solid">Aprobar y reservar por 3 horas</Button></form>
      <form action={discardPurchaseRequestAction} className="flex flex-wrap items-center gap-4 border-t border-slate-200 pt-4"><input name="requestId" type="hidden" value={request.id} /><label className="flex gap-3 text-sm"><input className={inputClass} name="discardConfirmed" required type="checkbox" value="yes" /><span>Confirmo descartar la solicitud y eliminar sus datos personales.</span></label><Button type="submit" variant="outline">Descartar solicitud</Button></form>
    </section>
  </div></Section></main>;
}
