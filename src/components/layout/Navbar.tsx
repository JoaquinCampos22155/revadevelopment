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
  return <details className="group relative"><summary className="flex min-h-11 cursor-pointer list-none items-center rounded-lg px-3 text-sm font-medium text-reva-brand-strong hover:bg-reva-muted focus:outline-none focus:ring-2 focus:ring-reva-focus [&::-webkit-details-marker]:hidden">Cuenta</summary><div className="absolute right-0 top-[3rem] z-50 w-52 rounded-xl border border-reva-border bg-reva-surface p-3 shadow-lg shadow-reva-primary/10"><p className="px-3 py-2 text-xs text-reva-secondary">Sesión activa</p>{isAdmin ? <Button className="flex w-full" href="/admin/productos" variant="outline">Gestión</Button> : null}<form action={onSignOut} className={isAdmin ? "mt-2" : ""}><Button className="flex w-full" type="submit" variant="outline">Cerrar sesión</Button></form></div></details>;
}

/** Keeps public discovery primary while moving authenticated operations into a compact utility boundary. */
export function Navbar({ isAdmin, isAuthenticated, onSignOut }: NavbarProps) {
  return <header className="sticky top-0 z-50 border-b border-reva-border/70 bg-reva-background/50 backdrop-blur-sm"><PageContainer><div className="relative flex min-h-20 items-center justify-between gap-4"><BrandLogo /><nav aria-label="Navegación principal" className="hidden items-center gap-5 lg:flex">{primaryNavigation.map((item) => <NavLink className="relative py-2 font-serif text-base tracking-wide text-reva-secondary transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-reva-brand after:transition-all hover:text-reva-primary hover:after:w-full" href={item.href} key={item.href}>{item.label}</NavLink>)}</nav><div className="hidden items-center lg:flex">{isAuthenticated ? <AccountUtility isAdmin={isAdmin} onSignOut={onSignOut} /> : <NavLink className="min-h-11 px-3 py-3 text-sm font-medium text-reva-brand-strong hover:text-reva-action focus:outline-none focus:ring-2 focus:ring-reva-focus" href={loginNavigation.href}>{loginNavigation.label}</NavLink>}</div><details className="lg:hidden"><summary className="flex min-h-11 cursor-pointer list-none items-center rounded-lg border border-reva-brand px-5 text-sm font-medium text-reva-primary [&::-webkit-details-marker]:hidden">Menú</summary><div className="absolute right-0 top-[4.5rem] z-50 w-64 rounded-xl border border-reva-border bg-reva-surface p-3 shadow-xl shadow-reva-primary/10"><nav aria-label="Navegación móvil" className="space-y-1">{primaryNavigation.map((item) => <NavLink className="block rounded-lg px-3 py-3 font-serif text-base text-reva-brand-strong hover:bg-reva-muted hover:text-reva-primary" href={item.href} key={item.href}>{item.label}</NavLink>)}</nav><div className="mt-2 border-t border-reva-muted pt-2">{isAuthenticated ? <>{isAdmin ? <Button className="flex w-full" href="/admin/productos" variant="outline">Gestión</Button> : null}<form action={onSignOut} className={isAdmin ? "mt-2" : ""}><Button className="flex w-full" type="submit" variant="outline">Cerrar sesión</Button></form></> : <Button className="flex w-full" href={loginNavigation.href} variant="outline">{loginNavigation.label}</Button>}</div></div></details></div></PageContainer></header>;
}
