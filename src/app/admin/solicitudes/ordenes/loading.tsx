import { Section } from "@/components/layout/Section";
import { TransactionalAdminShell } from "@/features/transactions/components/TransactionalAdminShell";

export default function OrdersLoading() {
  return <TransactionalAdminShell activeTab="orders"><main id="main-content" aria-busy="true" aria-live="polite">
    <Section><div className="mx-auto max-w-6xl space-y-8">
      <p className="text-sm font-medium text-reva-secondary" role="status">Cargando órdenes…</p>
      <div aria-hidden="true" className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80" key={index}>
          <div className="flex items-center gap-4 border-b border-slate-100 p-4"><div className="size-16 shrink-0 rounded-xl bg-reva-surface" /><div className="flex-1"><div className="h-4 w-40 max-w-full rounded bg-reva-surface" /><div className="mt-3 h-3 w-28 rounded bg-reva-surface" /></div><div className="h-5 w-20 rounded bg-reva-surface" /></div>
          <div className="grid gap-3 p-4 sm:grid-cols-2"><div className="h-16 rounded-xl border border-slate-100 bg-slate-50" /><div className="h-16 rounded-xl border border-slate-100 bg-slate-50" /></div>
        </div>)}
      </div>
    </div></Section>
  </main></TransactionalAdminShell>;
}
