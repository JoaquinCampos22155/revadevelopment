import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { footerNavigation } from "@/content/navigation";
import { socialLinks } from "@/content/social";
import { getInstagramContact } from "@/infrastructure/config/site-contact";

function InstagramIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" focusable="false" viewBox="0 0 24 24">
      <rect height="16" rx="4.5" stroke="currentColor" strokeWidth="1.6" width="16" x="4" y="4" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.4" cy="6.8" fill="currentColor" r="1" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" focusable="false" viewBox="0 0 24 24">
      <path d="M15.7 3h-3.2v11.1a2.8 2.8 0 1 1-2.8-2.8c.4 0 .8.1 1.1.2V8.2a6 6 0 1 0 4.9 5.9V8.3c1.3 1 2.9 1.6 4.6 1.6V6.7c-2.5 0-4.6-2.1-4.6-3.7Z" />
    </svg>
  );
}

/** Creates a compact, editorial closing point without competing with the page's primary conversion. */
export function Footer() {
  const instagram = getInstagramContact() ?? socialLinks.instagram;

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-200">
      <PageContainer>
        <div className="grid gap-8 py-9 sm:grid-cols-[1.2fr_1fr_auto] sm:items-start sm:py-10">
          <div className="max-w-sm space-y-3">
            <p className="font-serif text-2xl text-white">REVA</p>
            <p className="text-sm leading-6 text-slate-300">Moda circular para descubrir prendas con historia y darles una nueva vida.</p>
          </div>
          <nav aria-label="Información y ayuda">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-sky-200">Información</p>
            <ul className="grid gap-x-5 gap-y-2 text-sm sm:grid-cols-2">
              {footerNavigation.map((item) => <li key={item.href}><Link className="inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950" href={item.href}>{item.label}</Link></li>)}
            </ul>
          </nav>
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-sky-200">Redes</p>
            <ul className="flex gap-2">
              <li>
                <a aria-label={`Instagram ${instagram.label}`} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 text-slate-200 transition-colors hover:border-sky-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950" href={instagram.href} rel="noopener noreferrer" target="_blank">
                  <InstagramIcon />
                </a>
              </li>
              <li>
                <a aria-label="TikTok REVA @revagt26" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 text-slate-200 transition-colors hover:border-sky-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950" href={socialLinks.tiktok} rel="noopener noreferrer" target="_blank">
                  <TikTokIcon />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 text-xs text-slate-500">© {new Date().getFullYear()} REVA. Guatemala.</div>
      </PageContainer>
    </footer>
  );
}
