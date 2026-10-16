import type { Metadata } from "next";

import { CartPageClient } from "@/features/cart/components/CartPageClient";
import { isWhatsAppConfigured } from "@/infrastructure/config/site-contact";

export const metadata: Metadata = {
  title: "Tu carrito | REVA",
  description: "Revisa tu selección de prendas únicas de REVA.",
  robots: { follow: false, index: false },
};

/** A noindex review surface for a local selection; it is not an order or checkout. */
export default function CartPage() {
  return <CartPageClient canContactOnWhatsApp={isWhatsAppConfigured()} />;
}
