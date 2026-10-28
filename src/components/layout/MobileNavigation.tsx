"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { NavLink } from "@/components/common/NavLink";
import { Button } from "@/components/ui/Button";
import { CartTrigger } from "@/features/cart/components/CartTrigger";
import { loginNavigation, primaryNavigation } from "@/content/navigation";

type MobileNavigationProps = Readonly<{
  isAuthenticated: boolean;
  isAdmin: boolean;
  onSignOut: () => Promise<void>;
}>;

const panelId = "reva-mobile-navigation";

/** Owns only the small-screen navigation disclosure and its dismissal behavior. */
export function MobileNavigation({ isAdmin, isAuthenticated, onSignOut }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback((restoreFocus = true) => {
    setIsOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a[href], button:not(:disabled)")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ));
      const firstItem = focusable[0];
      const lastItem = focusable.at(-1);
      if (!firstItem || !lastItem) return;
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.dataset.mobileNavBackdrop !== undefined) return;
      if (target instanceof Node && !panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        closeMenu(false);
      }
    }

    function onResize() {
      if (window.matchMedia("(min-width: 64rem)").matches) closeMenu(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
    };
  }, [closeMenu, isOpen]);

  return (
    <div className="relative lg:hidden">
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="flex min-h-11 items-center rounded-lg border border-reva-brand px-5 text-sm font-medium text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus"
        onClick={() => {
          if (isOpen) setIsOpen(false);
          else {
            setPortalTarget(document.body);
            setIsOpen(true);
          }
        }}
        ref={triggerRef}
        type="button"
      >
        Menú
      </button>
      {portalTarget ? createPortal(
        <div aria-hidden="true" className={`fixed inset-0 z-40 bg-reva-primary/15 transition-opacity duration-200 motion-reduce:transition-none ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} data-mobile-nav-backdrop onClick={() => closeMenu()} />,
        portalTarget,
      ) : null}
      <div
        aria-hidden={!isOpen}
        aria-labelledby={`${panelId}-title`}
        aria-modal={isOpen || undefined}
        className={`absolute right-0 top-[4.5rem] z-50 w-[min(20rem,calc(100vw-2rem))] origin-top-right rounded-xl border border-reva-border bg-reva-surface p-3 shadow-xl shadow-reva-primary/10 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${isOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"}`}
        id={panelId}
        inert={!isOpen}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a, button")) closeMenu(false);
        }}
        ref={panelRef}
        role="dialog"
      >
        <h2 className="sr-only" id={`${panelId}-title`}>Menú de navegación</h2>
        <CartTrigger className="w-full justify-start" />
        <nav aria-label="Navegación móvil" className="space-y-1">
          {primaryNavigation.map((item) => <NavLink className="block rounded-lg px-3 py-3 font-serif text-base text-reva-brand-strong aria-[current=page]:bg-reva-muted aria-[current=page]:text-reva-primary hover:bg-reva-muted hover:text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href={item.href} key={item.href}>{item.label}</NavLink>)}
        </nav>
        <div className="mt-2 border-t border-reva-muted pt-2">
          {isAuthenticated ? <>
            {isAdmin ? <Button className="flex w-full" href="/admin/productos" variant="outline">Gestión</Button> : null}
            <form action={onSignOut} className={isAdmin ? "mt-2" : ""} onSubmit={() => closeMenu(false)}><Button className="flex w-full" type="submit" variant="outline">Cerrar sesión</Button></form>
          </> : <Button className="flex w-full" href={loginNavigation.href} variant="outline">{loginNavigation.label}</Button>}
        </div>
      </div>
    </div>
  );
}
