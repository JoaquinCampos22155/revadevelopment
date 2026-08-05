import { BrandLogo } from "@/components/common/BrandLogo";
import { NavLink } from "@/components/common/NavLink";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { loginNavigation, primaryNavigation } from "@/content/navigation";

/** Makes global navigation feel like a calm brand signature while preserving predictable discovery paths. */
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <PageContainer><div className="relative flex min-h-20 items-center justify-between gap-5"><BrandLogo /><nav aria-label="Navegación principal" className="hidden items-center gap-8 md:flex">{primaryNavigation.map((item) => <NavLink className="relative py-2 text-sm font-medium tracking-wide text-slate-600 transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-slate-950 after:transition-all hover:text-slate-950 hover:after:w-full" href={item.href} key={item.href}>{item.label}</NavLink>)}</nav><div className="hidden md:block"><Button href={loginNavigation.href} variant="solid">{loginNavigation.label}</Button></div><details className="md:hidden"><summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-slate-300 px-5 text-sm font-medium text-slate-950 [&::-webkit-details-marker]:hidden">Menú</summary><nav aria-label="Navegación móvil" className="absolute right-0 top-[4.5rem] w-60 space-y-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60">{primaryNavigation.map((item) => <NavLink className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-sky-50 hover:text-slate-950" href={item.href} key={item.href}>{item.label}</NavLink>)}<Button className="mt-2 flex w-full" href={loginNavigation.href} variant="solid">{loginNavigation.label}</Button></nav></details></div></PageContainer>
    </header>
  );
}
