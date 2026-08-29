import { BrandLogo } from "@/components/common/BrandLogo";
import { NavLink } from "@/components/common/NavLink";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { loginNavigation, primaryNavigation } from "@/content/navigation";

type NavbarProps = Readonly<{
  isAuthenticated: boolean;
  isAdmin: boolean;
  onSignOut: () => Promise<void>;
}>;

function AccountUtility({ isAdmin, onSignOut }: Readonly<{ isAdmin: boolean; onSignOut: () => Promise<void> }>) {
  return <details className="group relative"><summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full px-3 text-sm font-medium text-[#23415f] hover:bg-[#eef7fb] focus:outline-none focus:ring-2 focus:ring-[#1461a4] [&::-webkit-details-marker]:hidden">Cuenta</summary><div className="absolute right-0 top-[3rem] z-50 w-52 rounded-2xl border border-[#c7ddeb] bg-white p-3 shadow-lg shadow-[#10233d]/10"><p className="px-3 py-2 text-xs text-slate-500">Sesión activa</p>{isAdmin ? <Button className="flex w-full" href="/admin/productos" variant="outline">Gestión</Button> : null}<form action={onSignOut} className={isAdmin ? "mt-2" : ""}><Button className="flex w-full" type="submit" variant="outline">Cerrar sesión</Button></form></div></details>;
}

/** Keeps public discovery primary while moving authenticated operations into a compact utility boundary. */
export function Navbar({ isAdmin, isAuthenticated, onSignOut }: NavbarProps) {
  return <header className="sticky top-0 z-50 border-b border-[#c7ddeb] bg-[#f8f7f2]/95 backdrop-blur"><PageContainer><div className="relative flex min-h-20 items-center justify-between gap-4"><BrandLogo /><nav aria-label="Navegación principal" className="hidden items-center gap-5 lg:flex">{primaryNavigation.map((item) => <NavLink className="relative py-2 text-sm font-medium tracking-wide text-[#39556d] transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#1461a4] after:transition-all hover:text-[#10233d] hover:after:w-full" href={item.href} key={item.href}>{item.label}</NavLink>)}</nav><div className="hidden items-center lg:flex">{isAuthenticated ? <AccountUtility isAdmin={isAdmin} onSignOut={onSignOut} /> : <NavLink className="min-h-11 px-3 py-3 text-sm font-medium text-[#23415f] hover:text-[#1461a4] focus:outline-none focus:ring-2 focus:ring-[#1461a4]" href={loginNavigation.href}>{loginNavigation.label}</NavLink>}</div><details className="lg:hidden"><summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-[#9bc3dc] px-5 text-sm font-medium text-[#10233d] [&::-webkit-details-marker]:hidden">Menú</summary><div className="absolute right-0 top-[4.5rem] z-50 w-64 rounded-2xl border border-[#c7ddeb] bg-white p-3 shadow-xl shadow-[#10233d]/10"><nav aria-label="Navegación móvil" className="space-y-1">{primaryNavigation.map((item) => <NavLink className="block rounded-xl px-3 py-3 text-sm text-[#23415f] hover:bg-[#eef7fb] hover:text-[#10233d]" href={item.href} key={item.href}>{item.label}</NavLink>)}</nav><div className="mt-2 border-t border-[#dceef6] pt-2">{isAuthenticated ? <>{isAdmin ? <Button className="flex w-full" href="/admin/productos" variant="outline">Gestión</Button> : null}<form action={onSignOut} className={isAdmin ? "mt-2" : ""}><Button className="flex w-full" type="submit" variant="outline">Cerrar sesión</Button></form></> : <Button className="flex w-full" href={loginNavigation.href} variant="outline">{loginNavigation.label}</Button>}</div></div></details></div></PageContainer></header>;
}
