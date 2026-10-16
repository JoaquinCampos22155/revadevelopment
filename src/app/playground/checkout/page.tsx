import type { Metadata } from "next";

import { CheckoutPrototype } from "@/features/checkout-prototype/components/CheckoutPrototype";

export const metadata: Metadata = {
  title: "Checkout · prototipo privado | REVA",
  robots: { index: false, follow: false, noarchive: true },
};

/** Isolated, noindex visual prototype. It does not create a real checkout flow. */
export default function CheckoutPlaygroundPage() {
  return <CheckoutPrototype />;
}
