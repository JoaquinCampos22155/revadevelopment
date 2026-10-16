"use client";

import Link from "next/link";

import { CartLineList } from "@/features/cart/components/CartLineList";
import { useCart } from "@/features/cart/cart-context";
import { useCartProducts } from "@/features/cart/hooks/use-cart-products";
import { cartSubtotal } from "@/features/cart/cart-total";
import { createCheckoutHref } from "@/features/checkout/checkout-selection";

type CartPageClientProps = Readonly<{ canContactOnWhatsApp: boolean }>;

export function CartPageClient({ canContactOnWhatsApp }: CartPageClientProps) {
  const { clear, hydrated, items, removeItem } = useCart();
  const resolved = useCartProducts(true);
  const cartItems = resolved.items ?? [];
  const available = cartItems.flatMap((item) => item.product ? [item.product] : []);
  const subtotal = cartSubtotal(available.map((product) => product.price));
  const allSelectedProductsAvailable = cartItems.length === items.length && cartItems.length > 0 && cartItems.every(({ product }) => product !== null);
  const checkoutHref = allSelectedProductsAvailable && !resolved.loading && !resolved.refreshing && !resolved.error
    ? createCheckoutHref(available.map((product) => product.slug))
    : null;
  const emptyState = <div className="grid min-h-[min(48vh,32rem)] content-center justify-items-start py-12 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-10">
    <div>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-reva-brand-strong">Una selección para descubrir</p>
      <h2 className="mt-3 max-w-xl font-serif text-3xl leading-tight text-reva-primary sm:text-4xl">Tu próxima prenda puede estar esperándote.</h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-reva-secondary">Encuentra piezas únicas y conoce cada detalle antes de conversar con REVA.</p>
      <Link className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-reva-action px-5 text-sm font-medium text-reva-on-action transition-colors hover:bg-reva-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/catalogo">Explorar prendas <span aria-hidden="true" className="ml-2">→</span></Link>
    </div>
    <div aria-hidden="true" className="relative mt-10 hidden size-44 place-items-center rounded-full bg-reva-muted text-reva-brand-strong sm:grid">
      <span className="absolute -right-4 -top-4 size-20 rounded-full bg-reva-surface-strong/75" />
      <svg className="relative size-24" fill="none" viewBox="0 0 96 96"><path d="M22 37h52l4 45H18l4-45Z" stroke="currentColor" strokeWidth="1.5"/><path d="M36 39v-8a12 12 0 0 1 24 0v8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"/><path d="M35 55h26" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"/></svg>
    </div>
  </div>;

  return <main className="reva-route-transition" id="main-content">
    <section className="reva-motion-enter relative overflow-hidden bg-reva-action py-10 text-reva-on-action sm:py-14">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border border-reva-on-action/10 sm:right-12 sm:size-96" />
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 sm:px-8">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-reva-on-action/75">Tu selección REVA</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl" id="cart-page-heading" tabIndex={-1}>Tu carrito</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-reva-on-action/85">Revisa las piezas que elegiste antes de consultar con REVA.</p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 border-t border-reva-on-action/20 pt-4 sm:w-auto sm:border-0 sm:pt-0">
          <p className="text-sm text-reva-on-action/85">{items.length} {items.length === 1 ? "prenda seleccionada" : "prendas seleccionadas"}</p>
          {hydrated && items.length > 0 ? <button className="min-h-11 rounded-lg px-3 text-sm font-medium text-reva-on-action underline decoration-reva-on-action/40 underline-offset-4 hover:decoration-reva-on-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-on-action" onClick={() => { document.getElementById("cart-page-heading")?.focus(); clear(); }} type="button">Vaciar carrito</button> : null}
        </div>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-14">
      <div>
        {!hydrated ? <p className="py-10 text-sm text-reva-secondary">Cargando tu selección…</p> : null}
        {resolved.error ? <div className="space-y-3 py-10"><p className="text-sm text-reva-danger">No pudimos verificar las prendas ahora. No mostraremos precios guardados.</p><button className="min-h-11 rounded-lg px-3 text-sm font-medium text-reva-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" onClick={() => void resolved.refresh()} type="button">Intentar de nuevo</button></div> : null}
        {hydrated && !resolved.error ? <CartLineList ariaLabel="Prendas seleccionadas" emptyState={!resolved.loading ? emptyState : undefined} focusFallbackId="cart-page-heading" items={cartItems} onRemove={removeItem} pendingCount={resolved.pendingCount} /> : null}
        {resolved.refreshing && !resolved.error ? <p aria-live="polite" className="mt-3 text-sm text-reva-secondary">Actualizando disponibilidad y precios…</p> : null}
      </div>

      {items.length > 0 ? <aside aria-labelledby="cart-summary-heading" className="reva-motion-enter--second h-fit border-t-2 border-reva-action bg-reva-surface p-5 shadow-[0_16px_40px_rgba(32,53,61,0.1)] sm:p-7 lg:sticky lg:top-28">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-reva-brand-strong">Resumen de selección</p>
        <h2 className="mt-2 font-serif text-2xl text-reva-primary" id="cart-summary-heading">Prendas disponibles</h2>
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-reva-border pt-4"><span className="pb-1 text-sm text-reva-secondary">{resolved.loading || resolved.refreshing ? "Subtotal provisional" : "Subtotal de prendas"}</span><span className="reva-cart-value font-serif text-2xl tabular-nums text-reva-primary" key={resolved.error ? "error" : subtotal}>{resolved.error ? "—" : subtotal}</span></div>
        <p className="mt-3 text-xs leading-5 text-reva-secondary">Corresponde únicamente a las prendas verificadas. No incluye envío ni representa un total de pago. El carrito no reserva inventario.</p>
        {checkoutHref ? <Link className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-reva-action px-4 text-sm font-semibold text-reva-on-action transition-[transform,background-color,box-shadow] hover:-translate-y-0.5 hover:bg-reva-action-hover hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0" href={checkoutHref}>Continuar al Checkout</Link> : <p aria-live="polite" className="mt-5 text-xs leading-5 text-reva-secondary">{resolved.loading || resolved.refreshing ? "Verificando las prendas antes de continuar…" : resolved.error ? "No pudimos verificar la selección. Intenta de nuevo antes de continuar." : !canContactOnWhatsApp ? "La consulta de compra no está disponible ahora." : "Retira o revisa las prendas no disponibles para continuar."}</p>}
        <Link className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-reva-border bg-reva-surface px-4 text-sm font-medium text-reva-primary transition-colors hover:bg-reva-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/catalogo">Seguir explorando</Link>
      </aside> : null}
    </section>
  </main>;
}
