import "server-only";

import { createCartWhatsAppMessage } from "@/features/cart/cart-whatsapp-message";
import { createCheckoutContactMessage } from "@/features/checkout/checkout-contact-message";
import { createPurchaseRequestMessage, type PurchaseRequestMessageInput } from "@/features/transactions/purchase-request-message";

export type PublicProductContact = Readonly<{
  canonicalUrl: string | null;
  price: string;
  title: string;
}>;

/** Publicly approved fallback channels for the REVA contact route. */
export const REVA_PUBLIC_CONTACT_EMAIL = "cam22155@uvg.edu.gt";

function readWhatsAppNumber(): string | null {
  const rawValue = process.env.REVA_WHATSAPP_NUMBER?.trim();
  if (!rawValue) return null;

  const normalized = rawValue.replace(/[\s()+-]/g, "");
  return /^[1-9]\d{6,14}$/.test(normalized) ? normalized : null;
}

function readInstagramHandle(): string | null {
  const rawValue = process.env.REVA_INSTAGRAM_HANDLE?.trim();
  if (!rawValue) return null;

  const normalized = rawValue.startsWith("@") ? rawValue.slice(1) : rawValue;
  return /^[A-Za-z0-9._]{1,30}$/.test(normalized) ? normalized : null;
}

function createWhatsAppUrl(message: string): string | null {
  const number = readWhatsAppNumber();
  if (!number) return null;

  const url = new URL(`https://wa.me/${number}`);
  url.searchParams.set("text", message);
  return url.toString();
}

export function isWhatsAppConfigured(): boolean {
  return readWhatsAppNumber() !== null;
}

/** Resolves the optional public Instagram profile without allowing arbitrary destinations. */
export function getInstagramProfileUrl(): string | null {
  return getInstagramContact()?.href ?? null;
}

/** Resolves the configured public Instagram destination and its display label. */
export function getInstagramContact(): Readonly<{ href: string; label: string }> | null {
  const handle = readInstagramHandle();
  return handle ? { href: `https://www.instagram.com/${handle}/`, label: `@${handle}` } : null;
}

/** Builds a general REVA inquiry without including Product-specific information. */
export function getWhatsAppGeneralContactUrl(): string | null {
  return createWhatsAppUrl("Hola, tengo una consulta general sobre REVA.");
}

/** Builds a product-interest message from only the approved public PDP contract. */
export function getWhatsAppProductInterestUrl(product: PublicProductContact): string | null {
  if (!product.canonicalUrl) return null;

  return createWhatsAppUrl(`Hola, tengo interés en esta prenda de REVA:\n\n${product.title}\n${product.price}\n${product.canonicalUrl}`);
}

/** Creates a multi-Product inquiry using only current public titles, prices, and canonical links. */
export function getWhatsAppCartSelectionUrl(products: ReadonlyArray<Readonly<{ canonicalUrl: string; price: string; title: string }>>): string | null {
  const message = createCartWhatsAppMessage(products);
  return message ? createWhatsAppUrl(message) : null;
}

/** Builds a Checkout inquiry using only current public Product information. */
export function getWhatsAppCheckoutSelectionUrl(products: ReadonlyArray<Readonly<{ canonicalUrl: string; price: string; title: string }>>): string | null {
  const message = createCheckoutContactMessage(products);
  return message ? createWhatsAppUrl(message) : null;
}

/** Builds the privacy-minimized handoff only after a purchase request is committed. */
export function getWhatsAppPurchaseRequestUrl(request: PurchaseRequestMessageInput): string | null {
  const message = createPurchaseRequestMessage(request);
  return message ? createWhatsAppUrl(message) : null;
}

/** Resolves the selling journey's optional official contact channel. */
export function getWhatsAppSellingUrl(): string | null {
  return createWhatsAppUrl("Hola, quiero vender una prenda con REVA.");
}
