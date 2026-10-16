"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

import { cartReducer, initialCartState } from "@/features/cart/cart-state";
import { CART_STORAGE_KEY, parseCartStorage, serializeCartStorage } from "@/features/cart/cart-storage";

type CartContextValue = Readonly<{
  addItem: (slug: string, title: string) => void;
  announcement: string;
  clear: () => void;
  closeDrawer: () => void;
  drawerOpen: boolean;
  hydrated: boolean;
  items: ReadonlyArray<string>;
  openDrawer: () => void;
  removeItem: (slug: string) => void;
}>;

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(CART_STORAGE_KEY);
    } catch {
      // The in-memory Cart remains usable when browser storage is unavailable.
    }
    dispatch({ items: parseCartStorage(stored), type: "hydrate" });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      if (state.items.length === 0) window.localStorage.removeItem(CART_STORAGE_KEY);
      else window.localStorage.setItem(CART_STORAGE_KEY, serializeCartStorage(state.items));
    } catch {
      // Do not make browsing depend on optional local browser persistence.
    }
  }, [state.hydrated, state.items]);

  const value = useMemo<CartContextValue>(() => ({
    addItem: (slug, title) => dispatch({ slug, title, type: "add" }),
    announcement: state.announcement,
    clear: () => dispatch({ type: "clear" }),
    closeDrawer: () => dispatch({ open: false, type: "drawer" }),
    drawerOpen: state.drawerOpen,
    hydrated: state.hydrated,
    items: state.items,
    openDrawer: () => dispatch({ open: true, type: "drawer" }),
    removeItem: (slug) => dispatch({ slug, type: "remove" }),
  }), [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("Cart UI must be rendered inside CartProvider.");
  return context;
}
