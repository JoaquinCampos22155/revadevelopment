import { BrandLogo } from "@/components/common/BrandLogo";
import { NavLink } from "@/components/common/NavLink";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { loginNavigation, primaryNavigation } from "@/content/navigation";

/** Renders REVA's responsive global navigation without authentication logic. */
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-cyan-100 bg-white/95 backdrop-blur">
      <PageContainer>
        <div className="relative flex min-h-16 items-center justify-between gap-6">
          <BrandLogo />

          <nav
            aria-label="Navegación principal"
            className="hidden items-center gap-6 md:flex"
          >
            {primaryNavigation.map((item) => (
              <NavLink
                className="text-sm text-slate-700 transition-colors hover:text-cyan-800"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button href={loginNavigation.href} variant="solid">
              {loginNavigation.label}
            </Button>
          </div>

          <details className="md:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-cyan-200 bg-white px-5 text-sm font-medium text-slate-950 [&::-webkit-details-marker]:hidden">
              Menú
            </summary>
            <nav
              aria-label="Navegación móvil"
              className="absolute right-0 top-14 w-56 space-y-1 rounded-2xl border border-cyan-100 bg-white p-3 shadow-lg shadow-cyan-100/60"
            >
              {primaryNavigation.map((item) => (
                <NavLink
                  className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-cyan-50 hover:text-cyan-800"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </NavLink>
              ))}
              <Button
                className="mt-2 flex w-full"
                href={loginNavigation.href}
                variant="solid"
              >
                {loginNavigation.label}
              </Button>
            </nav>
          </details>
        </div>
      </PageContainer>
    </header>
  );
}
