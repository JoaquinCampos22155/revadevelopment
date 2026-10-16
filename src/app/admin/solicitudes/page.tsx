import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/Section";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { ExpirationCountdown } from "@/features/transactions/components/ExpirationCountdown";
import { requireCurrentAdmin } from "@/features/product-manager/server/admin-access";
import { listOrders, listPurchaseRequests } from "@/features/transactions/server/transactional-admin.server";
import { isLocalTransactionalRequestsEnabled } from "@/features/transactions/server/local-purchase-requests";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Solicitudes y órdenes | Administración REVA", robots: { follow: false, index: false } };

function money(value: string): string { return `Q ${value}`; }

export default async function TransactionManagementPage() {
  if (!isLocalTransactionalRequestsEnabled()) notFound();
  await requireCurrentAdmin();
  const [requests, orders] = await Promise.all([listPurchaseRequests(), listOrders()]);
  return <main id="main-content"><Section><div className="space-y-10">
    <div><Text variant="label">Administración interna · Gestión</Text><Heading className="mt-2" level={1} variant="editorial">Solicitudes y órdenes</Heading><Text className="mt-3 max-w-2xl" variant="body">Las solicitudes expiran individualmente. Aprobar una solicitud confirma disponibilidad y precios, y reserva cada prenda por tres horas; no confirma un pago.</Text><Link className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-reva-brand-strong underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/admin/productos">← Gestión de Productos</Link></div>
    <section aria-labelledby="requests-heading" className="space-y-4">
      <div><h2 className="font-sans text-3xl font-semibold tracking-tight" id="requests-heading">Solicitudes pendientes</h2><Text variant="quiet">Sin datos personales en esta lista; abre un detalle solo cuando necesites atenderlo.</Text></div>
      {requests.length ? <ul className="divide-y divide-slate-200 border-y border-slate-200 bg-white">{requests.map((request) => <li className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center" key={request.id}>
        <div><p className="font-semibold text-reva-primary">{request.publicReference}</p><p className="mt-1 text-sm text-reva-secondary">{request.items.length} prendas · {money(request.subtotal)} · creada {new Date(request.createdAt).toLocaleString("es-GT")}</p><p className="mt-1 text-sm text-reva-secondary">Expira en <ExpirationCountdown expiresAt={request.expiresAt} /></p></div>
        <Link className="inline-flex min-h-11 items-center justify-center rounded-full border border-reva-border px-4 text-sm font-semibold text-reva-primary hover:bg-reva-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href={`/admin/solicitudes/${request.id}`}>Revisar solicitud</Link>
      </li>)}</ul> : <p className="border-y border-dashed border-slate-300 px-5 py-8 text-sm text-reva-secondary">No hay solicitudes pendientes.</p>}
    </section>
    <section aria-labelledby="orders-heading" className="space-y-4">
      <div><h2 className="font-sans text-3xl font-semibold tracking-tight" id="orders-heading">Órdenes</h2><Text variant="quiet">Solo las órdenes pendientes de pago mantienen una reserva temporal.</Text></div>
      {orders.length ? <ul className="divide-y divide-slate-200 border-y border-slate-200 bg-white">{orders.map((order) => <li className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center" key={order.id}>
        <div><p className="font-semibold text-reva-primary">{order.publicReference}</p><p className="mt-1 text-sm text-reva-secondary">{order.status} · pago {order.paymentStatus} · preparación {order.fulfillmentStatus}</p><p className="mt-1 text-sm text-reva-secondary">Subtotal {money(order.merchandiseSubtotal)} · total {order.finalTotal ? money(order.finalTotal) : "entrega por confirmar"}</p></div>
        <Link className="inline-flex min-h-11 items-center justify-center rounded-full border border-reva-border px-4 text-sm font-semibold text-reva-primary hover:bg-reva-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href={`/admin/solicitudes/ordenes/${order.id}`}>Abrir orden</Link>
      </li>)}</ul> : <p className="border-y border-dashed border-slate-300 px-5 py-8 text-sm text-reva-secondary">Aún no hay órdenes.</p>}
    </section>
  </div></Section></main>;
}
