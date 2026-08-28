import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { footerNavigation } from "@/content/navigation";
import { socialLinks } from "@/content/social";

/** Creates a compact, editorial closing point without competing with the page's primary conversion. */
export function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-slate-950 text-slate-200 sm:mt-20"><PageContainer><div className="grid gap-7 py-10 sm:grid-cols-[1.35fr_0.65fr_0.65fr] sm:py-12"><div className="max-w-sm space-y-3"><p className="font-serif text-2xl text-white">REVA</p><p className="text-sm leading-6 text-slate-300">Moda circular para descubrir prendas con historia y darles una nueva vida.</p></div><div className="space-y-3"><p className="text-xs font-medium uppercase tracking-[0.12em] text-sky-200">Explorar</p><ul className="space-y-2 text-sm">{footerNavigation.map((item) => <li key={item.href}><Link className="transition-colors hover:text-white" href={item.href}>{item.label}</Link></li>)}</ul></div>{socialLinks.instagram ? <div className="space-y-3"><p className="text-xs font-medium uppercase tracking-[0.12em] text-sky-200">Seguir</p><a className="text-sm transition-colors hover:text-white" href={socialLinks.instagram}>Instagram</a></div> : null}</div><div className="border-t border-slate-800 py-4 text-xs text-slate-500">© {new Date().getFullYear()} REVA. Guatemala.</div></PageContainer></footer>
  );
}
