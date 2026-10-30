import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/Section";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { AdminOrderThumbnail } from "@/features/transactions/components/AdminOrderThumbnail";
import { TransactionalAdminShell } from "@/features/transactions/components/TransactionalAdminShell";
import { getAdminOrderTotalDisplay, getAdminPaginationPages, getAdminStatusTone, getSpanishOrderStatus, normalizeAdminOrderListFilters } from "@/features/transactions/transactional-admin-presentation";
import { isLocalTransactionalRequestsEnabled } from "@/features/transactions/server/local-purchase-requests";
import { listOrders } from "@/features/transactions/server/transactional-admin.server";
import { requireCurrentAdmin } from "@/features/product-manager/server/admin-access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Órdenes | Administración REVA", robots: { follow: false, index: false } };

type SearchParams = Readonly<Record<string, string | string[] | undefined>>;
type Props = Readonly<{ searchParams: Promise<SearchParams> }>;

const selectClass = "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus";
const inputClass = "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus";
const statusToneClass = {
  attention: "border-amber-200 bg-amber-50 text-amber-950",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-950",
  exception: "border-rose-200 bg-rose-50 text-rose-950",
  neutral: "border-slate-200 bg-slate-50 text-slate-800",
  progress: "border-sky-200 bg-sky-50 text-sky-950",
} as const;

function singleValue(value: string | string[] | undefined): string | undefined { return Array.isArray(value) ? value[0] : value; }

function pageHref(filters: ReturnType<typeof normalizeAdminOrderListFilters>, page: number): string {
  const query = new URLSearchParams();
  if (filters.search) query.set("search", filters.search);
  if (filters.status !== "all") query.set("status", filters.status);
  if (filters.payment !== "all") query.set("payment", filters.payment);
  if (filters.fulfillment !== "all") query.set("fulfillment", filters.fulfillment);
  if (filters.dateOrder !== "newest") query.set("dateOrder", filters.dateOrder);
  query.set("page", String(page));
  return `/admin/solicitudes/ordenes?${query.toString()}`;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  if (!isLocalTransactionalRequestsEnabled()) notFound();
  await requireCurrentAdmin();
  const query = await searchParams;
  const filters = normalizeAdminOrderListFilters({
    dateOrder: singleValue(query.dateOrder), fulfillment: singleValue(query.fulfillment), page: singleValue(query.page),
    payment: singleValue(query.payment), search: singleValue(query.search), status: singleValue(query.status),
  });

  let result;
  let loadFailed = false;
  try {
    result = await listOrders(filters);
  } catch {
    result = { items: [], page: 1, pageCount: 0, pageSize: 20, totalCount: 0 };
    loadFailed = true;
  }

  return <TransactionalAdminShell activeTab="orders"><main id="main-content"><Section><div className="mx-auto max-w-6xl space-y-8">
    <header className="space-y-3"><Text variant="label">Gestión de pago y entrega</Text><Heading level={1} variant="editorial">Órdenes</Heading><Text className="max-w-2xl" variant="body">Coordina pago y preparación por separado. Una orden pendiente no es una venta confirmada; solo la verificación administrativa manual registra el pago como recibido.</Text></header>
    <form action="/admin/solicitudes/ordenes" className="grid gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-6" method="get">
      <label className="block text-sm font-medium text-reva-primary xl:col-span-2">Buscar referencia<input className={`${inputClass} mt-2`} maxLength={64} name="search" placeholder="REVA-…" defaultValue={filters.search} /></label>
      <label className="block text-sm font-medium text-reva-primary">Estado de orden<select className={`${selectClass} mt-2`} defaultValue={filters.status} name="status"><option value="all">Todos</option><option value="pending_payment">Pendiente de pago</option><option value="paid">Pagada</option><option value="fulfilling">En preparación</option><option value="completed">Completada</option><option value="cancelled">Cancelada</option><option value="expired">Expirada</option></select></label>
      <label className="block text-sm font-medium text-reva-primary">Pago<select className={`${selectClass} mt-2`} defaultValue={filters.payment} name="payment"><option value="all">Todos</option><option value="not_started">No iniciado</option><option value="pending">Pendiente</option><option value="verified">Verificado</option><option value="pending_manual">Pendiente de verificación manual</option><option value="verified_manual">Verificado manualmente</option><option value="late_unverified">Pago tardío sin verificar</option><option value="expired">Expirado</option><option value="cancelled">Cancelado</option></select></label>
      <label className="block text-sm font-medium text-reva-primary">Preparación<select className={`${selectClass} mt-2`} defaultValue={filters.fulfillment} name="fulfillment"><option value="all">Todos</option><option value="not_ready">Aún no preparada</option><option value="ready">Lista para despacho</option><option value="preparing">En preparación</option><option value="dispatched">Despachada</option><option value="completed">Completada</option><option value="cancelled">Cancelada</option></select></label>
      <label className="block text-sm font-medium text-reva-primary">Ordenar fecha<select className={`${selectClass} mt-2`} defaultValue={filters.dateOrder} name="dateOrder"><option value="newest">Más recientes</option><option value="oldest">Más antiguas</option></select></label>
      <div className="flex flex-wrap items-end gap-3 sm:col-span-2 xl:col-span-6"><button className="inline-flex min-h-11 items-center justify-center rounded-full bg-reva-primary px-5 text-sm font-semibold text-white hover:bg-reva-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2" type="submit">Aplicar filtros</button><Link className="inline-flex min-h-11 items-center justify-center rounded-full border border-reva-border px-5 text-sm font-semibold text-reva-primary hover:bg-reva-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/admin/solicitudes/ordenes">Limpiar</Link></div>
    </form>

    {loadFailed ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-950" role="alert">No fue posible cargar las órdenes. Intenta recargar la página; no se modificó ningún dato.</p> : result.totalCount === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-5 py-8 text-sm text-reva-secondary">{filters.search || filters.status !== "all" || filters.payment !== "all" || filters.fulfillment !== "all" ? "Ninguna orden coincide con esos filtros." : "Aún no hay órdenes."}</p> : <>
      <p aria-live="polite" className="text-sm text-reva-secondary" role="status">{result.totalCount} {result.totalCount === 1 ? "orden" : "órdenes"} · página {result.page} de {result.pageCount}</p>
      <ul className="grid gap-4 md:grid-cols-2">{result.items.map((order) => <li className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-sm" key={order.id}>
        <div className="flex items-start gap-4 border-b border-slate-100 px-4 py-4 sm:px-5"><AdminOrderThumbnail thumbnail={order.thumbnail} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="break-all font-semibold text-reva-primary">{order.publicReference}</p><p className="mt-1 text-sm text-reva-secondary">Creada {new Date(order.createdAt).toLocaleString("es-GT")}</p></div><p className="text-lg font-semibold tabular-nums text-reva-primary">{getAdminOrderTotalDisplay(order.finalTotal, order.status)}</p></div></div></div>
        <dl className="grid gap-3 px-4 py-4 text-sm sm:grid-cols-2 sm:px-5"><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Estado de orden</dt><dd className="mt-1">{getSpanishOrderStatus("order", order.status)}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Prendas</dt><dd className="mt-1">{order.productCount} · subtotal Q {order.merchandiseSubtotal}</dd></div><div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Pago</dt><dd className="mt-2"><span className={`inline-flex min-h-7 items-center rounded-full border px-3 text-xs font-semibold ${statusToneClass[getAdminStatusTone("payment", order.paymentStatus)]}`}>{getSpanishOrderStatus("payment", order.paymentStatus)}</span></dd></div><div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Preparación</dt><dd className="mt-2"><span className={`inline-flex min-h-7 items-center rounded-full border px-3 text-xs font-semibold ${statusToneClass[getAdminStatusTone("fulfillment", order.fulfillmentStatus)]}`}>{getSpanishOrderStatus("fulfillment", order.fulfillmentStatus)}</span></dd></div></dl>
        <Link className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-reva-border px-4 text-sm font-semibold text-reva-primary hover:bg-reva-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href={`/admin/solicitudes/ordenes/${order.id}`}>Abrir orden</Link>
      </li>)}</ul>
      <nav aria-label="Páginas de órdenes" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
        {result.page > 1 ? <Link className="inline-flex min-h-11 items-center rounded-full border border-reva-border px-4 text-sm font-semibold text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href={pageHref(filters, result.page - 1)}>← Anterior</Link> : <span aria-disabled="true" className="inline-flex min-h-11 items-center rounded-full border border-slate-200 px-4 text-sm text-slate-500">← Anterior</span>}
        <ol className="flex flex-wrap items-center gap-2">{getAdminPaginationPages(result.page, result.pageCount).map((page, index) => <li key={`${page}-${index}`}>{page === "ellipsis" ? <span aria-hidden="true" className="px-1 text-reva-secondary">…</span> : <Link aria-current={page === result.page ? "page" : undefined} className={page === result.page ? "inline-flex size-11 items-center justify-center rounded-full bg-reva-primary text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2" : "inline-flex size-11 items-center justify-center rounded-full border border-reva-border text-sm font-semibold text-reva-primary hover:bg-reva-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus"} href={pageHref(filters, page)}>{page}</Link>}</li>)}</ol>
        {result.page < result.pageCount ? <Link className="inline-flex min-h-11 items-center rounded-full border border-reva-border px-4 text-sm font-semibold text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href={pageHref(filters, result.page + 1)}>Siguiente →</Link> : <span aria-disabled="true" className="inline-flex min-h-11 items-center rounded-full border border-slate-200 px-4 text-sm text-slate-500">Siguiente →</span>}
      </nav>
    </>}
  </div></Section></main></TransactionalAdminShell>;
}
