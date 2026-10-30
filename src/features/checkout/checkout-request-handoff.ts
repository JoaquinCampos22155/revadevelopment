export type CheckoutRequestHandoff = Readonly<{
  expiresAt: string;
  idempotencyKey: string;
  publicReference: string | null;
  selectionKey: string;
  whatsappUrl: string | null;
}>;

type TemporaryStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

const STORAGE_PREFIX = "reva.checkout.handoff.v1.";
const PUBLIC_REFERENCE_PATTERN = /^REVA-(?:[A-F0-9]{12}|[A-F0-9]{32})$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_STORED_BYTES = 12 * 1024;

/** Uses only the public item selection, not buyer fields, as a short-lived storage scope. */
export function checkoutRequestScopeKey(items: readonly Readonly<{ price: string; slug: string }>[]): string {
  return JSON.stringify(items.map(({ slug, price }) => ({ slug, price })));
}

export function getCheckoutHandoffStorageKey(selectionKey: string): string {
  return `${STORAGE_PREFIX}${encodeURIComponent(selectionKey)}`;
}

function isSafeWhatsAppUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > MAX_STORED_BYTES) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "wa.me" && /^\/[1-9]\d{6,14}$/.test(url.pathname)
      && url.searchParams.has("text") && !url.hash;
  } catch {
    return false;
  }
}

function parseHandoff(value: unknown, selectionKey: string): CheckoutRequestHandoff | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  if (record.selectionKey !== selectionKey || typeof record.idempotencyKey !== "string" || !UUID_PATTERN.test(record.idempotencyKey)
      || typeof record.expiresAt !== "string" || !Number.isFinite(Date.parse(record.expiresAt))) return null;
  const publicReference = record.publicReference;
  if (publicReference !== null && (typeof publicReference !== "string" || !PUBLIC_REFERENCE_PATTERN.test(publicReference))) return null;
  const whatsappUrl = record.whatsappUrl;
  if (whatsappUrl !== null && !isSafeWhatsAppUrl(whatsappUrl)) return null;
  return { expiresAt: record.expiresAt, idempotencyKey: record.idempotencyKey, publicReference, selectionKey, whatsappUrl };
}

/** Returns and expires a temporary request key/result; no buyer data is read or restored. */
export function readCheckoutHandoff(storage: TemporaryStorage, storageKey: string, selectionKey: string, now = Date.now()): CheckoutRequestHandoff | null {
  let raw: string | null;
  try {
    raw = storage.getItem(storageKey);
  } catch {
    return null;
  }
  if (!raw) return null;
  let record: CheckoutRequestHandoff | null = null;
  try {
    record = parseHandoff(JSON.parse(raw), selectionKey);
  } catch {
    record = null;
  }
  if (!record || Date.parse(record.expiresAt) <= now) {
    clearCheckoutHandoff(storage, storageKey);
    return null;
  }
  return record;
}

/** Stores only a random idempotency key, the public reference, expiry and public WhatsApp handoff. */
export function writeCheckoutHandoff(storage: TemporaryStorage, storageKey: string, value: CheckoutRequestHandoff): boolean {
  const parsed = parseHandoff(value, value.selectionKey);
  if (!parsed || Date.parse(parsed.expiresAt) <= Date.now()) return false;
  try {
    const serialized = JSON.stringify(parsed);
    if (new TextEncoder().encode(serialized).byteLength > MAX_STORED_BYTES) return false;
    storage.setItem(storageKey, serialized);
    return true;
  } catch {
    return false;
  }
}

export function clearCheckoutHandoff(storage: TemporaryStorage, storageKey: string): void {
  try {
    storage.removeItem(storageKey);
  } catch {
    // The caller will keep the current request state in memory.
  }
}
