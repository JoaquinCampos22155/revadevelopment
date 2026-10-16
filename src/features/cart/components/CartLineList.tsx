"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

import { CartLine } from "@/features/cart/components/CartLine";
import type { ResolvedCartItem } from "@/features/cart/hooks/use-cart-products";

type CartLineListProps = Readonly<{
  ariaLabel: string;
  density?: "drawer" | "page";
  emptyState?: ReactNode;
  focusFallbackId: string;
  items: ReadonlyArray<ResolvedCartItem>;
  onRemove: (slug: string) => void;
  pendingCount?: number;
}>;

type ExitingLine = Readonly<{ id: number; index: number; item: ResolvedCartItem }>;
type RenderLine = Readonly<{ id: number | undefined; item: ResolvedCartItem; key: string; exiting: boolean; originalIndex: number }>;

/** Keeps a single removed row briefly for its local exit motion while Cart state updates immediately. */
export function CartLineList({ ariaLabel, density = "page", emptyState, focusFallbackId, items, onRemove, pendingCount = 0 }: CartLineListProps) {
  const [exiting, setExiting] = useState<ReadonlyArray<ExitingLine>>([]);
  const nextExitId = useRef(0);
  const completeExit = useCallback((id: number) => {
    setExiting((current) => current.filter((line) => line.id !== id));
  }, []);
  const remove = useCallback((item: ResolvedCartItem, index: number) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion) {
      nextExitId.current += 1;
      setExiting((current) => [...current, { id: nextExitId.current, index, item }]);
    }
    onRemove(item.slug);
  }, [onRemove]);

  const rows: RenderLine[] = items.map((item, originalIndex) => ({ item, key: item.slug, exiting: false, id: undefined, originalIndex }));
  for (const line of exiting) {
    rows.splice(Math.min(line.index, rows.length), 0, { item: line.item, key: `exit-${line.id}`, exiting: true as const, id: line.id, originalIndex: line.index });
  }

  if (rows.length === 0 && pendingCount === 0) return emptyState ? <>{emptyState}</> : null;

  return <ul aria-label={ariaLabel} className="divide-y divide-reva-border">
    {rows.map((row) => <CartLine
      density={density}
      exiting={row.exiting}
      focusFallbackId={focusFallbackId}
      item={row.item}
      key={row.key}
      onExitComplete={row.id === undefined ? undefined : () => completeExit(row.id!)}
      onRemove={() => remove(row.item, row.originalIndex)}
    />)}
    {pendingCount > 0 ? <li aria-live="polite" className="py-4 text-sm text-reva-secondary">
      <span aria-hidden="true" className="mr-2 inline-block size-3 animate-pulse rounded-full bg-reva-brand/50 motion-reduce:animate-none" />
      Verificando {pendingCount === 1 ? "una prenda" : `${pendingCount} prendas`}…
    </li> : null}
  </ul>;
}
