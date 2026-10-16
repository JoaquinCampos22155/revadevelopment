import type { Metadata } from "next";

import { CheckoutPageClient } from "@/features/checkout/components/CheckoutPageClient";
import { parseCheckoutSelection } from "@/features/checkout/checkout-selection";
import { readCheckoutProducts } from "@/features/checkout/server/checkout-products";
import { isWhatsAppConfigured } from "@/infrastructure/config/site-contact";

export const metadata: Metadata = {
  title: "Revisa tu selección | REVA",
  description: "Revisa las prendas seleccionadas y consulta con REVA sobre disponibilidad y entrega.",
  robots: { index: false, follow: false, noarchive: true },
};

type CheckoutPageProps = Readonly<{
  searchParams: Promise<Readonly<{ product?: string | string[]; products?: string | string[] }>>;
}>;

/** Noindex, non-transactional Checkout inquiry; only public slugs enter via the URL. */
export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const selection = parseCheckoutSelection(await searchParams);
  if (selection.entry === "invalid" || selection.entry === "empty") {
    return <CheckoutPageClient canContactOnWhatsApp={isWhatsAppConfigured()} entry="cart" initialItems={[]} initialReadError={false} requestedSlugs={[]} selectionIssue={selection.entry} />;
  }

  const read = await readCheckoutProducts(selection.slugs);
  return <CheckoutPageClient
    canContactOnWhatsApp={isWhatsAppConfigured()}
    entry={selection.entry}
    initialItems={read.items}
    initialReadError={!read.ok}
    requestedSlugs={selection.slugs}
    selectionIssue={null}
  />;
}
