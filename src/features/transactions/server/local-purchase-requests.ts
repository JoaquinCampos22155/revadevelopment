import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

import { encryptSensitiveValue, loadTransactionalKeyrings, type EncryptedSensitiveValue } from "@/features/transactions/server/encryption";
import { getWhatsAppPurchaseRequestUrl } from "@/infrastructure/config/site-contact";

type RequestContact = Readonly<{ email: string; firstName: string; lastName: string; phone: string }>;
type RequestDelivery = Readonly<{
  apartment: string; houseNumber: string; neighborhood: string; reference: string;
  street: string; zone: string;
}>;
type RequestBilling = Readonly<{ nit: string; recipientName: string; type: "cf" | "nit" }>;
type ExpectedItem = Readonly<{ price: string; slug: string }>;

export type LocalPurchaseRequestInput = Readonly<{
  billing: RequestBilling;
  contact: RequestContact;
  delivery: RequestDelivery;
  expectedItems: readonly ExpectedItem[];
  idempotencyKey: string;
  municipalityCode: string;
  slugs: readonly string[];
}>;

export type LocalPurchaseRequestResult = Readonly<{
  status: "created" | "existing" | "changed" | "rate-limited" | "unavailable";
  url?: string;
}>;

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

/** The write path is deliberately enabled only in explicit local development. */
export function isLocalTransactionalRequestsEnabled(): boolean {
  if (process.env.NODE_ENV !== "development" || process.env.REVA_LOCAL_TRANSACTIONAL_ENABLED !== "true") return false;
  try {
    const hostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname.replace(/^\[|\]$/g, "");
    return LOOPBACK_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

function getLocalKeyrings() {
  try {
    return loadTransactionalKeyrings(process.env);
  } catch {
    throw new Error("Local transactional key configuration is unavailable.");
  }
}

function createLocalClient() {
  if (!isLocalTransactionalRequestsEnabled()) throw new Error("Local transactional requests are disabled.");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !publishableKey || !serviceRoleKey) throw new Error("Local Supabase is not configured for transactional requests.");
  const hostname = new URL(url).hostname.replace(/^\[|\]$/g, "");
  if (!LOOPBACK_HOSTS.has(hostname)) throw new Error("Transactional service credential is restricted to local Supabase.");

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
    global: { headers: { "x-client-info": "reva-local-purchase-request-rpc" } },
  });
}

function encryptFields(fields: Readonly<Record<string, string>>, requestId: string, keyring: ReadonlyMap<number, Uint8Array>, keyVersion: number): Readonly<Record<string, EncryptedSensitiveValue>> {
  return Object.fromEntries(Object.entries(fields).map(([field, value]) => [field, encryptSensitiveValue(
    value,
    { field, recordId: requestId, recordType: "purchase_request" },
    keyring,
    keyVersion,
  )]));
}

function safeRpcResult(value: unknown): Readonly<{ items: readonly Readonly<{ price: string; quantity: number; sku: string; title: string }>[]; publicReference: string; status: string; subtotal: string }> | null {
  if (!Array.isArray(value) || value.length !== 1 || typeof value[0] !== "object" || value[0] === null) return null;
  const row = value[0] as Record<string, unknown>;
  if (!["created", "existing", "changed", "rate_limited"].includes(String(row.status))) return null;
  if (row.status === "rate_limited") return { items: [], publicReference: "", status: "rate_limited", subtotal: "" };
  if (row.status === "changed") return { items: [], publicReference: "", status: "changed", subtotal: "" };
  if (typeof row.public_reference !== "string" || !/^REVA-[A-F0-9]{12}$/.test(row.public_reference)
      || typeof row.merchandise_subtotal !== "number" && typeof row.merchandise_subtotal !== "string"
      || !Array.isArray(row.items)) return null;

  const items = row.items.flatMap((item: unknown) => {
    if (typeof item !== "object" || item === null) return [];
    const candidate = item as Record<string, unknown>;
    if (typeof candidate.sku !== "string" || !/^RV-\d{6,}$/.test(candidate.sku)
        || typeof candidate.title !== "string" || typeof candidate.price !== "number" && typeof candidate.price !== "string"
        || candidate.quantity !== 1) return [];
    const price = Number(candidate.price).toFixed(2);
    if (!/^\d+\.\d{2}$/.test(price)) return [];
    return [{ price, quantity: 1, sku: candidate.sku, title: candidate.title }];
  });
  if (items.length !== row.items.length || items.length < 1) return null;
  return {
    items,
    publicReference: row.public_reference,
    status: String(row.status),
    subtotal: Number(row.merchandise_subtotal).toFixed(2),
  };
}

/** Calls exactly one narrowly granted RPC; this client is not exposed as a repository. */
export async function submitLocalPurchaseRequest(
  input: LocalPurchaseRequestInput,
  customerProfileId: string | null,
  fingerprint: string,
): Promise<LocalPurchaseRequestResult> {
  if (!isLocalTransactionalRequestsEnabled()) return { status: "unavailable" };
  const keyrings = getLocalKeyrings();
  const requestId = randomUUID();
  const { activeVersion: encryptionVersion, keys: encryptionKeys } = keyrings.encryption;
  const { activeVersion: hmacVersion, keys: hmacKeys } = keyrings.hmac;
  const activeHmacKey = hmacKeys.get(hmacVersion);
  if (!activeHmacKey) return { status: "unavailable" };
  const digestWithAllRetainedKeys = (purpose: string, value: string) => [...hmacKeys.entries()]
    .sort(([left], [right]) => left - right)
    .map(([version, key]) => ({
      digest: createHmac("sha256", key).update(`${purpose}:${value}`).digest(),
      version,
    }));
  const idempotencyCandidates = digestWithAllRetainedKeys("idempotency", input.idempotencyKey);
  const fingerprintCandidates = digestWithAllRetainedKeys("rate-limit", fingerprint);
  const activeIdempotency = idempotencyCandidates.find(({ version }) => version === hmacVersion);
  const activeFingerprint = fingerprintCandidates.find(({ version }) => version === hmacVersion);
  if (!activeIdempotency || !activeFingerprint) return { status: "unavailable" };
  const contactCiphertext = encryptFields({
    email: input.contact.email,
    first_name: input.contact.firstName,
    last_name: input.contact.lastName,
    phone: input.contact.phone,
  }, requestId, encryptionKeys, encryptionVersion);
  const deliveryCiphertext = encryptFields({
    apartment: input.delivery.apartment,
    house_number: input.delivery.houseNumber,
    neighborhood: input.delivery.neighborhood,
    reference: input.delivery.reference,
    street: input.delivery.street,
    zone: input.delivery.zone,
  }, requestId, encryptionKeys, encryptionVersion);
  const billingCiphertext = encryptFields({ nit: input.billing.nit, recipient_name: input.billing.recipientName }, requestId, encryptionKeys, encryptionVersion);

  const client = createLocalClient();
  const { data, error } = await client.rpc("create_purchase_request", {
    p_request_id: requestId,
    p_slugs: [...input.slugs],
    p_expected_items: input.expectedItems.map(({ slug, price }) => ({ slug, price })),
    p_contact_ciphertext: contactCiphertext,
    p_delivery_ciphertext: deliveryCiphertext,
    p_municipality_code: input.municipalityCode,
    p_billing_type: input.billing.type,
    p_billing_ciphertext: billingCiphertext,
    p_idempotency_digest: `\\x${activeIdempotency.digest.toString("hex")}`,
    p_idempotency_candidates: idempotencyCandidates.map(({ digest, version }) => ({ digest: digest.toString("hex"), version })),
    p_fingerprint_digest: `\\x${activeFingerprint.digest.toString("hex")}`,
    p_fingerprint_candidates: fingerprintCandidates.map(({ digest, version }) => ({ digest: digest.toString("hex"), version })),
    p_user_id: customerProfileId,
    p_key_version: encryptionVersion,
    p_hmac_key_version: hmacVersion,
  });
  if (error) {
    if (error.message === "PRODUCT_UNAVAILABLE") return { status: "unavailable" };
    throw new Error("Purchase request could not be submitted.");
  }
  const result = safeRpcResult(data);
  if (!result) throw new Error("Purchase request could not be submitted.");
  if (result.status === "changed") return { status: "changed" };
  if (result.status === "rate_limited") return { status: "rate-limited" };

  const url = getWhatsAppPurchaseRequestUrl({
    items: result.items,
    publicReference: result.publicReference,
    subtotal: result.subtotal,
  });
  return url ? { status: result.status as "created" | "existing", url } : { status: "unavailable" };
}
