"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getPublicCartProducts } from "@/features/cart/server/cart.actions";
import type { CartProductResult } from "@/features/cart/cart.types";
import type { ResolvedCartItem } from "@/features/cart/cart-projection";
import { useCart } from "@/features/cart/cart-context";

export type { ResolvedCartItem };

/** Resolves persisted slugs against current public Product projections whenever Cart is shown. */
export function useCartProducts(active: boolean) {
  const { hydrated, items } = useCart();
  const [requestNumber, setRequestNumber] = useState(0);
  const [response, setResponse] = useState<Readonly<{ requestNumber: number; result: CartProductResult; signature: string }> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const priorSlugs = useRef<ReadonlyArray<string>>([]);
  const wasActive = useRef(false);
  const signature = items.join("\u0000");
  const slugs = useMemo(() => signature ? signature.split("\u0000") : [], [signature]);

  const refresh = useCallback(() => setRequestNumber((current) => current + 1), []);

  useEffect(() => {
    const newlyAdded = slugs.some((slug) => !priorSlugs.current.includes(slug));
    const justOpened = active && !wasActive.current;
    priorSlugs.current = slugs;
    wasActive.current = active;
    if (!active || !hydrated) return;
    if (response?.requestNumber === requestNumber && !response.result.ok) return;

    const responseCoversSelection = response?.result.ok === true
      && slugs.every((slug) => response.result.items.some((item) => item.slug === slug));
    const alreadyCurrent = responseCoversSelection && response?.requestNumber === requestNumber;
    if (alreadyCurrent && !newlyAdded && !justOpened) return;

    let current = true;
    setRefreshing(true);
    void getPublicCartProducts(slugs).then((result) => {
      if (!current) return;
      setResponse({ requestNumber, result, signature });
      setRefreshing(false);
    }).catch(() => {
      if (!current) return;
      setResponse({ requestNumber, result: { items: [], ok: false }, signature });
      setRefreshing(false);
    });
    return () => { current = false; setRefreshing(false); };
  }, [active, hydrated, requestNumber, response, signature, slugs]);

  const responseIsSuccessful = response?.result.ok === true;
  const currentSlugs = new Set(slugs);
  const knownItems = responseIsSuccessful
    ? response.result.items.filter((item) => currentSlugs.has(item.slug))
    : null;
  const hasUnresolvedItems = knownItems === null || slugs.some((slug) => !knownItems.some((item) => item.slug === slug));
  const responseFailedForCurrentRequest = response?.requestNumber === requestNumber && !response.result.ok;

  return {
    error: responseFailedForCurrentRequest,
    items: responseFailedForCurrentRequest ? null : knownItems,
    loading: !hydrated || (active && (hasUnresolvedItems || response?.requestNumber !== requestNumber)),
    refreshing: active && refreshing,
    pendingCount: responseFailedForCurrentRequest ? 0 : knownItems === null ? slugs.length : slugs.filter((slug) => !knownItems.some((item) => item.slug === slug)).length,
    refresh,
    slugs,
  };
}
