"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";

type AccountMenuProps = Readonly<{
  isAdmin: boolean;
  onSignOut: () => Promise<void>;
}>;

/** Keeps the authenticated utility menu dismissible without changing Auth authority. */
export function AccountMenu({ isAdmin, onSignOut }: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function closeWhenOutside(event: PointerEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function closeWithEscape(event: KeyboardEvent): void {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", closeWhenOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeWhenOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-reva-brand-strong hover:bg-reva-muted focus:outline-none focus:ring-2 focus:ring-reva-focus"
        onClick={() => setIsOpen((open) => !open)}
        ref={triggerRef}
        type="button"
      >
        Cuenta
      </button>
      {isOpen ? (
        <div
          className="absolute right-0 top-[3rem] z-50 w-52 rounded-xl border border-reva-border bg-reva-surface p-3 shadow-lg shadow-reva-primary/10"
          id={menuId}
        >
          <p className="px-3 py-2 text-xs text-reva-secondary">Sesión activa</p>
          {isAdmin ? <Button className="flex w-full" href="/admin/productos" onClick={() => setIsOpen(false)} variant="outline">Gestión</Button> : null}
          <form action={onSignOut} className={isAdmin ? "mt-2" : ""} onSubmit={() => setIsOpen(false)}>
            <Button className="flex w-full" type="submit" variant="outline">Cerrar sesión</Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
