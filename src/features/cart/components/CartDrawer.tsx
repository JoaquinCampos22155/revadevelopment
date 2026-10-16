"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { CartLineList } from "@/features/cart/components/CartLineList";
import { useCart } from "@/features/cart/cart-context";
import { useCartProducts } from "@/features/cart/hooks/use-cart-products";
import { cartSubtotal } from "@/features/cart/cart-total";
import { createCheckoutHref } from "@/features/checkout/checkout-selection";

type CartDrawerProps = Readonly<{ canContactOnWhatsApp: boolean }>;

export function CartDrawer({ canContactOnWhatsApp }: CartDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { announcement, closeDrawer, drawerOpen, hydrated, items, removeItem } = useCart();
  const resolved = useCartProducts(drawerOpen);
  const cartItems = resolved.items ?? [];
  const available = cartItems.flatMap((item) => item.product ? [item.product] : []);
  const subtotal = cartSubtotal(available.map((product) => product.price));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (drawerOpen && !dialog.open) {
      dialog.showModal();
      closeRef.current?.focus();
    } else if (!drawerOpen && dialog.open) {
      dialog.close();
    }
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const root = document.documentElement;
    const originalOverflow = root.style.overflow;
    const originalGutter = root.style.scrollbarGutter;
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = originalOverflow;
      root.style.scrollbarGutter = originalGutter;
    };
  }, [drawerOpen]);

  const unavailableItems = cartItems.filter((item) => !item.product);
  const availableSlugs = available.map((product) => product.slug);
  const checkoutHref = !resolved.loading && !resolved.refreshing && !resolved.error && unavailableItems.length === 0
    ? createCheckoutHref(availableSlugs)
    : null;
  const unavailableSignature = unavailableItems.map((item) => item.slug).join(",");
  const emptyState = <div className="grid min-h-[min(62vh,34rem)] content-center justify-items-start py-10">
    <div aria-hidden="true" className="relative mb-8 grid size-24 place-items-center rounded-full bg-reva-muted text-reva-brand-strong">
      <span className="absolute -right-2 -top-1 size-8 rounded-full bg-reva-surface-strong/70" />
      <svg className="relative size-12" fill="none" viewBox="0 0 48 48"><path d="M11 19h26l2 22H9l2-22Z" stroke="currentColor" strokeWidth="1.5"/><path d="M18 20v-4a6 6 0 0 1 12 0v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"/><path d="M17 27h14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"/></svg>
    </div>
    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-reva-brand-strong">Cada pieza tiene su propia historia</p>
    <h3 className="mt-3 max-w-sm font-serif text-3xl leading-tight text-reva-primary">Tu próxima prenda puede estar esperándote.</h3>
    <p className="mt-3 max-w-sm text-sm leading-6 text-reva-secondary">Explora prendas reales, seleccionadas para seguir circulando con intención.</p>
    <Link className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-reva-action px-5 text-sm font-medium text-reva-on-action transition-colors hover:bg-reva-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/catalogo" onClick={closeDrawer}>Explorar prendas <span aria-hidden="true" className="ml-2">→</span></Link>
  </div>;

  return <>
    <p aria-atomic="true" aria-live="polite" className="sr-only">{announcement}</p>
    <dialog
      aria-labelledby="cart-drawer-heading"
      aria-modal="true"
      className="reva-cart-dialog fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-reva-primary"
      onCancel={(event) => { event.preventDefault(); closeDrawer(); }}
      onClick={(event) => { if (event.target === dialogRef.current) closeDrawer(); }}
      onClose={() => { if (drawerOpen) closeDrawer(); }}
      ref={dialogRef}
    >
      <section className="reva-cart-drawer-panel ml-auto flex h-full w-full max-w-[38rem] flex-col bg-reva-background shadow-2xl shadow-reva-primary/25" aria-describedby="cart-drawer-description">
        <header className="flex items-start justify-between gap-4 border-b border-reva-primary/15 bg-reva-action px-5 py-6 text-reva-on-action sm:px-8">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-reva-on-action/75">Tu selección REVA</p>
            <h2 className="mt-1 font-serif text-3xl tracking-tight" id="cart-drawer-heading" tabIndex={-1}>Tu carrito</h2>
            <p className="mt-2 text-sm text-reva-on-action/80" id="cart-drawer-description">{items.length} {items.length === 1 ? "prenda seleccionada" : "prendas seleccionadas"}</p>
          </div>
          <button aria-label="Cerrar carrito" className="grid size-11 shrink-0 place-items-center rounded-full border border-reva-on-action/30 bg-reva-on-action/10 transition-colors hover:bg-reva-on-action/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-on-action" onClick={closeDrawer} ref={closeRef} type="button">
            <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="m6.5 6.5 11 11m0-11-11 11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-reva-background px-5 sm:px-8">
          {!hydrated ? <p aria-live="polite" className="py-8 text-sm text-reva-secondary">Cargando tu selección…</p> : null}
          {resolved.error ? <div className="space-y-3 py-8"><p className="text-sm text-reva-danger">No pudimos verificar las prendas ahora. No mostraremos precios guardados.</p><button className="min-h-11 rounded-lg px-3 text-sm font-medium text-reva-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" onClick={() => void resolved.refresh()} type="button">Intentar de nuevo</button></div> : null}
          {!resolved.error && hydrated ? <CartLineList ariaLabel="Prendas seleccionadas" density="drawer" emptyState={!resolved.loading ? emptyState : undefined} focusFallbackId="cart-drawer-heading" items={cartItems} onRemove={removeItem} pendingCount={resolved.pendingCount} /> : null}
          {resolved.refreshing && !resolved.error ? <p aria-live="polite" className="sr-only">Actualizando disponibilidad y precios.</p> : null}
          {unavailableSignature ? <p aria-live="polite" className="sr-only">Hay prendas no disponibles que puedes retirar de tu carrito.</p> : null}
        </div>

        {available.length > 0 && !resolved.error ? <footer className="border-t border-reva-border bg-reva-surface px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-12px_32px_rgba(32,53,61,0.1)] sm:px-8 sm:pt-5">
          <div className="mb-3 flex items-end justify-between gap-4"><span className="pb-1 text-sm font-medium text-reva-secondary">{resolved.loading || resolved.refreshing ? "Subtotal provisional" : "Subtotal de prendas"}</span><span className="reva-cart-value font-serif text-2xl tabular-nums text-reva-primary" key={subtotal}>{subtotal}</span></div>
          <p className="mb-4 text-xs leading-5 text-reva-secondary">Solo prendas disponibles. No incluye envío ni representa un total de pago. Agregar al carrito no reserva una prenda.</p>
          {resolved.loading || resolved.refreshing ? <p className="mb-3 text-xs text-reva-secondary">Actualizando disponibilidad y precios…</p> : null}
          {checkoutHref ? <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-reva-action px-5 text-sm font-semibold text-reva-on-action transition-[transform,background-color,box-shadow] hover:-translate-y-0.5 hover:bg-reva-action-hover hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0" href={checkoutHref} onClick={closeDrawer}>Continuar al Checkout</Link> : <p aria-live="polite" className="mb-2 text-xs leading-5 text-reva-secondary">{resolved.loading || resolved.refreshing ? "Verificando las prendas antes de continuar…" : unavailableItems.length > 0 ? "Retira o revisa las prendas no disponibles para continuar." : canContactOnWhatsApp ? "No pudimos preparar esta selección para Checkout." : "El canal de consulta todavía no está disponible."}</p>}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-reva-border px-3 text-sm font-medium text-reva-primary transition-colors hover:bg-reva-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/carrito" onClick={closeDrawer}>Ver selección</Link>
            <button className="min-h-11 rounded-lg px-3 text-sm font-medium text-reva-secondary transition-colors hover:text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" onClick={closeDrawer} type="button">Seguir explorando</button>
          </div>
        </footer> : null}
      </section>
    </dialog>
  </>;
}
