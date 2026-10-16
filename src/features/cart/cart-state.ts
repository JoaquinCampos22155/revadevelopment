import { addCartItem, normalizeCartItems, removeCartItem } from "@/features/cart/cart-storage";

export type CartState = Readonly<{
  announcement: string;
  drawerOpen: boolean;
  hydrated: boolean;
  items: ReadonlyArray<string>;
}>;

export type CartAction =
  | Readonly<{ type: "hydrate"; items: ReadonlyArray<string> }>
  | Readonly<{ type: "add"; slug: string; title: string }>
  | Readonly<{ type: "remove"; slug: string }>
  | Readonly<{ type: "clear" }>
  | Readonly<{ type: "drawer"; open: boolean }>;

export const initialCartState: CartState = { announcement: "", drawerOpen: false, hydrated: false, items: [] };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { ...state, hydrated: true, items: normalizeCartItems([...state.items, ...action.items]) };
    case "add": {
      const alreadyAdded = state.items.includes(action.slug);
      const items = addCartItem(state.items, action.slug);
      const announcement = alreadyAdded
        ? `${action.title} ya está en tu carrito.`
        : items.length === state.items.length
          ? "Tu carrito llegó al máximo de prendas guardadas."
          : `${action.title} se agregó a tu carrito.`;
      return { ...state, announcement, drawerOpen: true, items };
    }
    case "remove":
      return { ...state, announcement: "Prenda retirada de tu selección.", items: removeCartItem(state.items, action.slug) };
    case "clear":
      return { ...state, announcement: "Carrito vacío.", items: [] };
    case "drawer":
      return { ...state, drawerOpen: action.open };
  }
}
