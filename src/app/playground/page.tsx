import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Laboratorio UI | REVA",
  robots: { follow: false, index: false },
};

/** Lists isolated visual experiments without changing the public Home route. */
export default function DesignPlayground() {
  return <main className="min-h-screen bg-stone-100 px-5 py-12 text-slate-950 sm:px-8">
    <div className="mx-auto max-w-3xl space-y-8"><p className="text-xs font-semibold uppercase tracking-[0.18em]">Uso interno · noindex</p><h1 className="font-serif text-5xl tracking-tight">Exploraciones Home</h1><p className="max-w-xl leading-7 text-slate-600">Direcciones aisladas. Ninguna reemplaza la Home pública.</p><nav aria-label="Direcciones visuales" className="grid gap-3 sm:grid-cols-2"><Link className="rounded-2xl bg-[#f5eee3] p-5 font-serif text-xl text-[#54281f]" href="/playground/calido">A · Cálido original</Link><Link className="rounded-2xl bg-[#151515] p-5 font-serif text-xl text-stone-100" href="/playground/editorial">B · Editorial</Link><Link className="rounded-2xl bg-[#2255c9] p-5 font-serif text-xl text-[#fff9eb]" href="/playground/vivo">C · Vivo</Link><Link className="rounded-2xl bg-[#f8f7f2] p-5 font-serif text-xl text-[#10233d]" href="/playground/reva-blue">REVA Blue Editorial</Link></nav></div>
  </main>;
}
