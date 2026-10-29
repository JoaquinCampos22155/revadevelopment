import { Section } from "@/components/layout/Section";
import { TransactionalAdminShell } from "@/features/transactions/components/TransactionalAdminShell";

export default function RequestsLoading() {
  return <TransactionalAdminShell activeTab="requests"><main id="main-content" aria-busy="true" aria-live="polite">
    <Section><div className="mx-auto max-w-6xl space-y-8">
      <p className="text-sm font-medium text-reva-secondary" role="status">Cargando solicitudes…</p>
      <div aria-hidden="true" className="divide-y divide-slate-200 border-y border-slate-200">
        {Array.from({ length: 4 }, (_, index) => <div className="grid min-h-24 gap-3 border-l-2 border-sky-700/40 bg-white/70 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5" key={index}>
          <div><div className="h-4 w-36 rounded bg-reva-surface" /><div className="mt-3 h-3 w-3/4 rounded bg-reva-surface" /><div className="mt-2 h-3 w-1/2 rounded bg-reva-surface" /></div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0"><div className="h-4 w-24 rounded bg-reva-surface" /><div className="h-11 w-36 rounded-full bg-reva-surface" /></div>
        </div>)}
      </div>
    </div></Section>
  </main></TransactionalAdminShell>;
}
