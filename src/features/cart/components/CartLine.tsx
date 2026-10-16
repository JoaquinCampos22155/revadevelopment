"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";

import type { ResolvedCartItem } from "@/features/cart/hooks/use-cart-products";

type CartLineProps = Readonly<{
  density?: "drawer" | "page";
  exiting?: boolean;
  focusFallbackId: string;
  item: ResolvedCartItem;
  onExitComplete?: () => void;
  onRemove: (slug: string) => void;
}>;

/** Shows current public garment facts, or a transparent unavailable state without stale Product claims. */
export function CartLine({ density = "page", exiting = false, focusFallbackId, item, onExitComplete, onRemove }: CartLineProps) {
  const rowRef = useRef<HTMLLIElement>(null);
  const removedRef = useRef(false);
  const onExitCompleteRef = useRef(onExitComplete);
  const { product } = item;

  useLayoutEffect(() => { onExitCompleteRef.current = onExitComplete; }, [onExitComplete]);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!exiting || !row || typeof row.animate !== "function") return;
    const { borderBottomWidth, paddingBlockEnd, paddingBlockStart } = window.getComputedStyle(row);
    const height = row.getBoundingClientRect().height;
    const exit = row.animate(
      [
        { height: `${height}px`, opacity: 1, paddingBlockEnd, paddingBlockStart, borderBottomWidth, transform: "translateX(0)" },
        { height: "0px", opacity: 0, paddingBlockEnd: "0px", paddingBlockStart: "0px", borderBottomWidth: "0px", transform: "translateX(-0.5rem)" },
      ],
      { duration: 190, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", fill: "forwards" },
    );
    void exit.finished.then(() => onExitCompleteRef.current?.(), () => onExitCompleteRef.current?.());
  }, [exiting]);

  function remove() {
    if (removedRef.current || exiting) return;
    removedRef.current = true;

    const row = rowRef.current;
    const findVisibleRemoveControl = (sibling: Element | null) => Array.from(
      sibling?.querySelectorAll<HTMLButtonElement>("[data-cart-remove]") ?? [],
    ).find((button) => button.getClientRects().length > 0);
    const focusTarget = findVisibleRemoveControl(row?.nextElementSibling ?? null)
      ?? findVisibleRemoveControl(row?.previousElementSibling ?? null)
      ?? document.getElementById(focusFallbackId);
    focusTarget?.focus();
    onRemove(item.slug);
  }

  const isDrawer = density === "drawer";
  const imageSize = isDrawer
    ? "grid-cols-[5rem_minmax(0,1fr)] sm:grid-cols-[5.5rem_minmax(0,1fr)_auto]"
    : "grid-cols-[7rem_minmax(0,1fr)] sm:grid-cols-[8.5rem_minmax(0,1fr)_auto]";
  const rowSpacing = isDrawer ? "py-2.5" : "py-5";
  const removeText = exiting ? "Retirando…" : "Retirar";

  if (!product) {
    return (
      <li aria-hidden={exiting || undefined} className={`${exiting ? "" : "reva-cart-line"} flex items-center justify-between gap-4 border-b border-reva-border ${rowSpacing}`} ref={rowRef} style={exiting ? { overflow: "hidden" } : undefined}>
        <p className="max-w-sm text-sm leading-6 text-reva-secondary">Esta prenda ya no está disponible. Retírala de tu selección para continuar.</p>
        <button aria-label="Retirar prenda no disponible" className="min-h-10 shrink-0 rounded-lg px-3 text-sm font-medium text-reva-primary underline decoration-reva-border underline-offset-4 hover:text-reva-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" data-cart-remove disabled={exiting} onClick={remove} type="button">{removeText}</button>
      </li>
    );
  }

  return (
    <li aria-hidden={exiting || undefined} className={`${exiting ? "" : "reva-cart-line"} grid ${imageSize} gap-3 border-b border-reva-border ${rowSpacing} sm:gap-4`} ref={rowRef} style={exiting ? { overflow: "hidden" } : undefined}>
      {product.image ? <Image alt={product.image.alt} className={`aspect-[4/5] w-full rounded-lg bg-reva-muted object-cover ${isDrawer ? "shadow-[4px_4px_0_var(--reva-surface-strong)]" : "shadow-[8px_8px_0_var(--reva-surface-strong)]"}`} height={product.image.height} sizes={isDrawer ? "(max-width: 639px) 80px, 88px" : "(max-width: 640px) 112px, 136px"} src={product.image.src} width={product.image.width} /> : <div aria-hidden="true" className="aspect-[4/5] rounded-lg bg-reva-muted shadow-[8px_8px_0_var(--reva-surface-strong)]" />}
      <div className="min-w-0 self-center">
        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-reva-brand-strong">Pieza única</p>
        <h3 className={`mt-1 font-serif leading-snug text-reva-primary ${isDrawer ? "text-base sm:text-lg" : "text-lg sm:text-xl"}`}>{product.title}</h3>
        <p className={`mt-1.5 text-reva-secondary ${isDrawer ? "text-xs sm:text-sm" : "text-sm"}`}>{[product.sizeLabel, product.condition].filter(Boolean).join(" · ")}</p>
        <p className={`mt-1.5 font-medium tabular-nums text-reva-primary ${isDrawer ? "text-sm" : ""}`}>{product.price}</p>
        <button aria-label={`Retirar ${product.title} del carrito`} className="mt-1 min-h-10 rounded-lg px-1 text-sm font-medium text-reva-secondary underline decoration-reva-border underline-offset-4 hover:text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus sm:hidden" data-cart-remove disabled={exiting} onClick={remove} type="button">{removeText}</button>
      </div>
      <button aria-label={`Retirar ${product.title} del carrito`} className="hidden min-h-10 self-center rounded-lg px-2 text-sm font-medium text-reva-secondary underline decoration-reva-border underline-offset-4 hover:text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus sm:block" data-cart-remove disabled={exiting} onClick={remove} type="button">{removeText}</button>
    </li>
  );
}
