import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/Section";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { ExpirationCountdown } from "@/features/transactions/components/ExpirationCountdown";
import { TransactionalAdminShell } from "@/features/transactions/components/TransactionalAdminShell";
import { requireCurrentAdmin } from "@/features/product-manager/server/admin-access";
import { listPurchaseRequests } from "@/features/transactions/server/transactional-admin.server";
import { isLocalTransactionalRequestsEnabled } from "@/features/transactions/server/local-purchase-requests";
import { getAdminPaginationPages, normalizeAdminPurchaseRequestListFilters } from "@/features/transactions/transactional-admin-presentation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Solicitudes y órdenes | Administración REVA", robots: { follow: false, index: false } };

function money(value: string): string { return `Q ${value}`; }

const resultMessages: Readonly<Record<string, string>> = {
  approved: "La solicitud se aprobó y se creó una orden pendiente de pago.",
  discarded: "La solicitud se descartó y sus datos operativos se eliminaron.",
  "review-required": "Confirma disponibilidad y precio antes de aprobar.",
  invalid: "La acción no se pudo completar con los datos recibidos.",
  unauthorized: "No tienes autorización para completar esta acción.",
  failed: "No se pudo completar la acción. Recarga y revisa el estado actual.",
};

type SearchParams = Readonly<Record<string, string | string[] | undefined>>;
type Props = Readonly<{ searchParams: Promise<SearchParams> }>;

function valueOf(value: string | string[] | undefined): string | undefined { return Array.isArray(value) ? value[0] : value; }

function requestPageHref(filters: ReturnType<typeof normalizeAdminPurchaseRequestListFilters>, page: number): string {
  const query = new URLSearchParams();
  if (filters.search) query.set("search", filters.search);
  if (filters.status !== "all") query.set("status", filters.status);
  if (filters.dateOrder !== "newest") query.set("dateOrder", filters.dateOrder);
  query.set("page", String(page));
  return `/admin/solicitudes?${query.toString()}`;
}

const controlClass = "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus";

export default async function TransactionManagementPage({ searchParams }: Props) {
  if (!isLocalTransactionalRequestsEnabled()) notFound();
  await requireCurrentAdmin();
  const query = await searchParams;
  const filters = normalizeAdminPurchaseRequestListFilters({ dateOrder: valueOf(query.dateOrder), page: valueOf(query.page), search: valueOf(query.search), status: valueOf(query.status) });
  const requestResult = await listPurchaseRequests(filters).then((page) => ({ page, failed: false })).catch(() => ({ page: { items: [], page: 1, pageCount: 0, pageSize: 20, totalCount: 0 }, failed: true }));
  const requests = requestResult.page.items;
  const resultCode = valueOf(query.result);
  const resultMessage = resultCode ? resultMessages[resultCode] ?? "No se pudo completar la acción. Recarga y revisa el estado actual." : null;
  return <TransactionalAdminShell activeTab="requests"><main id="main-content"><Section><div className="mx-auto max-w-6xl space-y-8">
    <header className="space-y-3"><Text variant="label">Administración interna · Ventas y órdenes</Text><Heading className="mt-2" level={1} variant="editorial">Solicitudes</Heading><Text className="max-w-2xl" variant="body">Una solicitud temporal no es una venta. Revisar y aprobar confirma disponibilidad y precios; la orden resultante queda pendiente de pago y reserva cada prenda por tres horas.</Text><Link className="inline-flex min-h-11 items-center text-sm font-semibold text-reva-brand-strong underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/admin/productos">← Gestión de Productos</Link></header>
    {resultMessage ? <p aria-live="polite" className="rounded-xl border-l-2 border-reva-brand-strong bg-white px-4 py-3 text-sm leading-6 text-reva-primary" role="status">{resultMessage}</p> : null}
    <section aria-labelledby="requests-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2"><div><Text variant="label">Bandeja de revisión</Text><h2 className="mt-1 font-sans text-2xl font-semibold tracking-tight" id="requests-heading">Solicitudes vigentes</h2><Text variant="quiet">Intenciones de compra sin reservar. Prioriza el plazo de revisión.</Text></div><span className="text-xs font-medium text-reva-secondary">Sin datos personales en esta lista</span></div>
      <form action="/admin/solicitudes" className="grid gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4" method="get">
        <label className="block text-sm font-medium text-reva-primary sm:col-span-2">Buscar referencia<input className={controlClass} defaultValue={filters.search} maxLength={32} name="search" placeholder="REVA-…" /></label>
        <label className="block text-sm font-medium text-reva-primary">Estado<select className={controlClass} defaultValue={filters.status} name="status"><option value="all">Todas las vigentes</option><option value="pending_review">Pendiente de revisión</option></select></label>
        <label className="block text-sm font-medium text-reva-primary">Ordenar fecha<select className={controlClass} defaultValue={filters.dateOrder} name="dateOrder"><option value="newest">Más recientes</option><option value="oldest">Más antiguas</option></select></label>
        <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-4"><button className="inline-flex min-h-11 items-center justify-center rounded-full bg-reva-primary px-5 text-sm font-semibold text-white hover:bg-reva-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2" type="submit">Aplicar filtros</button><Link className="inline-flex min-h-11 items-center justify-center rounded-full border border-reva-border px-5 text-sm font-semibold text-reva-primary hover:bg-reva-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/admin/solicitudes">Limpiar</Link></div>
      </form>
      {requestResult.failed ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-950" role="alert">No fue posible cargar las solicitudes. Intenta recargar la página; no se modificó ningún dato.</p> : requests.length ? <>
      <p aria-live="polite" className="text-sm text-reva-secondary" role="status">{requestResult.page.totalCount} {requestResult.page.totalCount === 1 ? "solicitud" : "solicitudes"} · página {requestResult.page.page} de {requestResult.page.pageCount}</p>
      <ul aria-label="Solicitudes pendientes" className="divide-y divide-slate-200 border-y border-slate-200">{requests.map((request) => <li className="grid gap-4 border-l-2 border-sky-700/60 bg-white/80 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5" key={request.id}>
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-x-3 gap-y-2"><p className="font-semibold text-reva-primary">{request.publicReference}</p><span className="inline-flex min-h-7 items-center rounded-full bg-sky-50 px-3 text-xs font-semibold text-sky-900">Pendiente de revisión</span></div>
          <p className="mt-2 text-sm text-reva-secondary">{request.productCount} {request.productCount === 1 ? "prenda" : "prendas"} · creada {new Date(request.createdAt).toLocaleString("es-GT")}</p>
          <p className="mt-1 text-sm text-reva-primary"><span className="font-semibold">Plazo de revisión:</span> <ExpirationCountdown expiresAt={request.expiresAt} /></p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0"><p className="text-sm font-semibold text-reva-primary">Subtotal · {money(request.subtotal)}</p><Link className="inline-flex min-h-11 items-center justify-center rounded-full border border-reva-border px-4 text-sm font-semibold text-reva-primary hover:bg-reva-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href={`/admin/solicitudes/${request.id}`}>Revisar solicitud</Link></div>
      </li>)}</ul>
      <nav aria-label="Páginas de solicitudes" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
        {requestResult.page.page > 1 ? <Link className="inline-flex min-h-11 items-center rounded-full border border-reva-border px-4 text-sm font-semibold text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href={requestPageHref(filters, requestResult.page.page - 1)}>← Anterior</Link> : <span aria-disabled="true" className="inline-flex min-h-11 items-center rounded-full border border-slate-200 px-4 text-sm text-slate-500">← Anterior</span>}
        <ol className="flex flex-wrap items-center gap-2">{getAdminPaginationPages(requestResult.page.page, requestResult.page.pageCount).map((page, index) => <li key={`${page}-${index}`}>{page === "ellipsis" ? <span aria-hidden="true" className="px-1 text-reva-secondary">…</span> : <Link aria-current={page === requestResult.page.page ? "page" : undefined} className={page === requestResult.page.page ? "inline-flex size-11 items-center justify-center rounded-full bg-reva-primary text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2" : "inline-flex size-11 items-center justify-center rounded-full border border-reva-border text-sm font-semibold text-reva-primary hover:bg-reva-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus"} href={requestPageHref(filters, page)}>{page}</Link>}</li>)}</ol>
        {requestResult.page.page < requestResult.page.pageCount ? <Link className="inline-flex min-h-11 items-center rounded-full border border-reva-border px-4 text-sm font-semibold text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href={requestPageHref(filters, requestResult.page.page + 1)}>Siguiente →</Link> : <span aria-disabled="true" className="inline-flex min-h-11 items-center rounded-full border border-slate-200 px-4 text-sm text-slate-500">Siguiente →</span>}
      </nav>
      </> : <p className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-5 py-8 text-sm text-reva-secondary">No hay solicitudes pendientes de revisión que coincidan con estos filtros.</p>}
    </section>
  </div></Section></main></TransactionalAdminShell>;
}
