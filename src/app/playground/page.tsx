import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";

export const metadata: Metadata = {
  title: "Footer Exploration | REVA",
  robots: { follow: false, index: false },
};

/** Keeps the playground focused on the one global decision explored during Sprint 10. */
export default function DesignPlayground() {
  return (
    <main id="main-content">
      <section className="bg-slate-100 py-12 sm:py-20">
        <PageContainer>
          <div className="max-w-2xl space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Footer exploration
            </p>
            <h1 className="font-serif text-4xl tracking-tight text-slate-950 sm:text-5xl">
              Un cierre oscuro, editorial y sin ruido.
            </h1>
            <p className="text-base leading-7 text-slate-600">
              La propuesta usa un bloque de alta contrastación para separar el contenido de la navegación secundaria y reforzar el final de la exploración.
            </p>
          </div>
        </PageContainer>
      </section>
      <section className="bg-slate-950 py-12 text-slate-200 sm:py-16">
        <PageContainer>
          <div className="grid gap-8 sm:grid-cols-3">
            <div><p className="font-serif text-3xl text-white">REVA</p><p className="mt-3 text-sm leading-6 text-slate-400">Moda circular para prendas que aún tienen algo que contar.</p></div>
            <div><p className="text-xs font-medium uppercase tracking-[0.12em] text-sky-200">Explorar</p><p className="mt-4 text-sm">Catálogo · Nosotros · Contacto</p></div>
            <div><p className="text-xs font-medium uppercase tracking-[0.12em] text-sky-200">Comunidad</p><p className="mt-4 text-sm">Instagram · Novedades REVA</p></div>
          </div>
        </PageContainer>
      </section>
    </main>
  );
}
