import { BrandLogo } from "@/components/common/BrandLogo";
import { NavLink } from "@/components/common/NavLink";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { loginNavigation, primaryNavigation } from "@/content/navigation";
import { CartTrigger } from "@/features/cart/components/CartTrigger";

type NavbarProps = Readonly<{
  isAuthenticated: boolean;
  isAdmin: boolean;
  onSignOut: () => Promise<void>;
}>;

/** Keeps public discovery primary while moving authenticated operations into a compact utility boundary. */
export function Navbar({ isAdmin, isAuthenticated, onSignOut }: NavbarProps) {
  return <header className="sticky top-0 z-50 border-b border-reva-border/70 bg-reva-background/50 backdrop-blur-sm"><PageContainer><div className="relative flex min-h-20 items-center justify-between gap-4"><BrandLogo /><nav aria-label="Navegación principal" className="hidden items-center gap-5 lg:flex">{primaryNavigation.map((item) => <NavLink className="relative py-2 font-serif text-base tracking-wide text-reva-secondary transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-reva-brand after:transition-all aria-[current=page]:text-reva-primary aria-[current=page]:after:w-full hover:text-reva-primary hover:after:w-full" href={item.href} key={item.href}>{item.label}</NavLink>)}</nav><div className="hidden items-center gap-2 lg:flex"><CartTrigger />{isAuthenticated ? <AccountMenu isAdmin={isAdmin} onSignOut={onSignOut} /> : <NavLink className="min-h-11 px-3 py-3 text-sm font-medium text-reva-brand-strong hover:text-reva-action focus:outline-none focus:ring-2 focus:ring-reva-focus" href={loginNavigation.href}>{loginNavigation.label}</NavLink>}</div><MobileNavigation isAdmin={isAdmin} isAuthenticated={isAuthenticated} onSignOut={onSignOut} /></div></PageContainer></header>;
}
