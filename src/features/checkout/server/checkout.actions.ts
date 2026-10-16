"use server";

import { readCheckoutProducts } from "@/features/checkout/server/checkout-products";
import type { CheckoutProduct, CheckoutResolvedItem } from "@/features/checkout/checkout.types";
import { hasCheckoutPriceChanged } from "@/features/checkout/checkout-selection";
import { getPublicProductUrl } from "@/infrastructure/config/site";
import { getWhatsAppCheckoutSelectionUrl, isWhatsAppConfigured } from "@/infrastructure/config/site-contact";
import { isCartProductSlug, MAX_CART_ITEMS, normalizeCartItems } from "@/features/cart/cart-storage";
import { validateCheckoutDelivery } from "@/features/checkout/checkout-validation";
import { isLocalTransactionalRequestsEnabled, submitLocalPurchaseRequest, type LocalPurchaseRequestInput } from "@/features/transactions/server/local-purchase-requests";
import { getCurrentUserProfile } from "@/features/users/server/current-user.service";
import { isTrustedRevaOrigin } from "@/infrastructure/config/site";
import { headers } from "next/headers";

type CheckoutActionResult = Readonly<{
  items: readonly CheckoutResolvedItem[];
  status: "invalid" | "unavailable" | "changed" | "contact-unavailable" | "ready";
  url?: string;
}>;

function validSlugs(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.length > 0 && value.length <= MAX_CART_ITEMS && value.every(isCartProductSlug);
}

function validSnapshot(value: unknown): value is readonly Readonly<{ price: string; slug: string }> [] {
  return Array.isArray(value) && value.length > 0 && value.length <= MAX_CART_ITEMS && value.every((item) =>
    typeof item === "object" && item !== null && "slug" in item && isCartProductSlug(item.slug)
      && "price" in item && typeof item.price === "string" && /^\d+\.\d{2}$/.test(item.price));
}

/** Rechecks inventory and price immediately before creating the public-only inquiry URL. */
export async function createCheckoutWhatsAppUrl(slugs: unknown, expected: unknown): Promise<CheckoutActionResult> {
  if (!validSlugs(slugs) || !validSnapshot(expected)) return { items: [], status: "invalid" };
  const requested = normalizeCartItems(slugs);
  if (requested.length !== slugs.length || expected.length !== requested.length) return { items: [], status: "invalid" };

  const result = await readCheckoutProducts(requested);
  if (!result.ok) return { items: [], status: "unavailable" };
  if (result.items.some(({ product }) => !product)) return { items: result.items, status: "unavailable" };

  const products = result.items.flatMap(({ product }) => product ? [product] : []);
  if (hasCheckoutPriceChanged(products.map(({ slug, price }) => ({ slug, price })), expected)) {
    return { items: result.items, status: "changed" };
  }
  if (!isWhatsAppConfigured()) return { items: result.items, status: "contact-unavailable" };

  try {
    const url = getWhatsAppCheckoutSelectionUrl(products.map((product: CheckoutProduct) => ({
      canonicalUrl: getPublicProductUrl(product.slug),
      price: product.price,
      title: product.title,
    })));
    return url ? { items: result.items, status: "ready", url } : { items: result.items, status: "contact-unavailable" };
  } catch {
    return { items: result.items, status: "contact-unavailable" };
  }
}

type LocalRequestResult = Readonly<{ status: "changed" | "invalid" | "rate-limited" | "ready" | "unavailable"; url?: string }>;

function safeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  if (cleaned.length > maxLength || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(cleaned)) return null;
  return cleaned;
}

function parseLocalRequest(value: unknown, slugs: readonly string[], expected: readonly Readonly<{ slug: string; price: string }>[] , idempotencyKey: unknown): LocalPurchaseRequestInput | null {
  if (typeof value !== "object" || value === null || !/^[0-9a-f-]{36}$/i.test(String(idempotencyKey))) return null;
  const record = value as Record<string, unknown>;
  const contact = typeof record.contact === "object" && record.contact !== null ? record.contact as Record<string, unknown> : null;
  const delivery = typeof record.delivery === "object" && record.delivery !== null ? record.delivery as Record<string, unknown> : null;
  const billing = typeof record.billing === "object" && record.billing !== null ? record.billing as Record<string, unknown> : null;
  if (!contact || !delivery || !billing) return null;

  const firstName = safeText(contact.firstName, 100);
  const lastName = safeText(contact.lastName, 100);
  const email = safeText(contact.email, 254);
  const phone = safeText(contact.phone, 30);
  const municipalityCode = safeText(record.municipalityCode, 4);
  const street = safeText(delivery.street, 200);
  const houseNumber = safeText(delivery.houseNumber, 80);
  const zone = safeText(delivery.zone, 100);
  const neighborhood = safeText(delivery.neighborhood, 120);
  const apartment = safeText(delivery.apartment, 120);
  const reference = safeText(delivery.reference, 300);
  const recipientName = safeText(billing.recipientName, 160);
  const nit = safeText(billing.nit, 40);
  const type = billing.type === "cf" || billing.type === "nit" ? billing.type : null;
  if (!firstName || !lastName || email === null || !phone || !municipalityCode || !street || !houseNumber || zone === null
      || neighborhood === null || apartment === null || reference === null || recipientName === null || nit === null || !type
      || (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return null;
  if (Object.keys(validateCheckoutDelivery({ firstName, lastName, phone, municipalityCode, street, houseNumber })).length > 0) return null;

  return {
    billing: { nit, recipientName, type },
    contact: { email, firstName, lastName, phone },
    delivery: { apartment, houseNumber, neighborhood, reference, street, zone },
    expectedItems: expected,
    idempotencyKey: String(idempotencyKey),
    municipalityCode,
    slugs,
  };
}

/** Local-only guest/authenticated submission boundary; it can call only the narrow transactional RPC. */
export async function createLocalCheckoutPurchaseRequest(
  slugs: unknown,
  expected: unknown,
  details: unknown,
  idempotencyKey: unknown,
): Promise<LocalRequestResult> {
  if (!isLocalTransactionalRequestsEnabled()) return { status: "unavailable" };
  if (!validSlugs(slugs) || !validSnapshot(expected)) return { status: "invalid" };
  const requested = normalizeCartItems(slugs);
  if (requested.length !== slugs.length || expected.length !== requested.length) return { status: "invalid" };
  const expectedItems = expected as readonly Readonly<{ price: string; slug: string }>[];
  if (requested.some((slug) => !expectedItems.some((item) => item.slug === slug))) return { status: "invalid" };
  const input = parseLocalRequest(details, requested, expectedItems, idempotencyKey);
  if (!input) return { status: "invalid" };

  const requestHeaders = await headers();
  if (!isTrustedRevaOrigin(requestHeaders.get("origin"))) return { status: "unavailable" };
  const forwardedAddress = requestHeaders.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
  const directAddress = requestHeaders.get("x-real-ip")?.trim();
  const fingerprint = (forwardedAddress || directAddress || "local-unknown").slice(0, 64);
  const profile = await getCurrentUserProfile();
  if (!isWhatsAppConfigured()) return { status: "unavailable" };

  try {
    const result = await submitLocalPurchaseRequest(input, profile?.id ?? null, fingerprint);
    if (result.status === "changed" || result.status === "rate-limited") return { status: result.status };
    if (result.status !== "created" && result.status !== "existing" || !result.url) return { status: "unavailable" };
    return { status: "ready", url: result.url };
  } catch {
    return { status: "unavailable" };
  }
}
