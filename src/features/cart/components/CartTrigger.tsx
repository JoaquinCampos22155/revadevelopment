"use client";

import { useCart } from "@/features/cart/cart-context";

type CartTriggerProps = Readonly<{ className?: string }>;

/** A compact, keyboard-accessible entry that opens the Cart Drawer without changing route. */
export function CartTrigger({ className = "" }: CartTriggerProps) {
  const { items, openDrawer, drawerOpen } = useCart();
  const count = items.length;

  return (
    <button
      aria-expanded={drawerOpen}
      aria-haspopup="dialog"
      aria-label={count > 0 ? `Abrir carrito, ${count} ${count === 1 ? "prenda" : "prendas"}` : "Abrir carrito"}
      className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-reva-brand-strong transition-colors hover:bg-reva-muted hover:text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus ${className}`}
      onClick={(event) => {
        const menu = event.currentTarget.closest("details");
        if (menu) {
          menu.removeAttribute("open");
          menu.querySelector("summary")?.focus();
        }
        openDrawer();
      }}
      type="button"
    >
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
        <path d="M5 8h14l1.2 12H3.8L5 8Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
      </svg>
      <span>Carrito</span>
      {count > 0 ? <span aria-hidden="true" className="reva-cart-count grid min-w-5 place-items-center rounded-full bg-reva-brand-strong px-1.5 text-xs leading-5 text-reva-on-action" key={count}>{count}</span> : null}
    </button>
  );
}
