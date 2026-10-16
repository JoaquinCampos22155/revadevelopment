import "server-only";

import { decryptSensitiveValue, loadTransactionalKeyrings, type EncryptedSensitiveValue } from "@/features/transactions/server/encryption";
import { isLocalTransactionalRequestsEnabled } from "@/features/transactions/server/local-purchase-requests";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

type CipherFields = Readonly<Record<string, EncryptedSensitiveValue>>;
type JsonRecord = Record<string, unknown>;
type RequestItem = Readonly<{ currentPrice?: string | null; currentStatus?: string | null; price: string; sku: string; title: string }>;
type AccessEvent = Readonly<{ createdAt: string; purpose: string }>;

const keyringFromEnvironment = (): ReadonlyMap<number, Uint8Array> => {
  if (!isLocalTransactionalRequestsEnabled()) throw new Error("Transactional data is unavailable.");
  try {
    return loadTransactionalKeyrings(process.env).encryption.keys;
  } catch {
    throw new Error("Transactional data is unavailable.");
  }
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decryptFields(value: unknown, recordId: string): Readonly<Record<string, string>> {
  if (!isRecord(value)) throw new Error("Transactional data is unavailable.");
  const keyring = keyringFromEnvironment();
  return Object.fromEntries(Object.entries(value as CipherFields).map(([field, envelope]) => {
    if (!isRecord(envelope) || typeof envelope.ciphertext !== "string" || typeof envelope.nonce !== "string"
        || typeof envelope.tag !== "string" || typeof envelope.keyVersion !== "number") {
      throw new Error("Transactional data is unavailable.");
    }
    return [field, decryptSensitiveValue(envelope, { field, recordId, recordType: "purchase_request" }, keyring)];
  }));
}

async function callAdminRpc<T>(functionName: string, args: Readonly<Record<string, unknown>> = {}): Promise<T> {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc(functionName as never, args as never);
  if (error) throw new Error("Transactional admin data is unavailable.");
  return data as T;
}

export type PurchaseRequestListItem = Readonly<{
  createdAt: string;
  expiresAt: string;
  id: string;
  items: readonly RequestItem[];
  publicReference: string;
  subtotal: string;
}>;

export type DecryptedPurchaseRequest = PurchaseRequestListItem & Readonly<{
  billing: Readonly<Record<string, string>>;
  billingType: "cf" | "nit";
  contact: Readonly<Record<string, string>>;
  delivery: Readonly<Record<string, string>>;
  accessEvents: readonly AccessEvent[];
  municipalityCode: string;
}>;

function parseItems(value: unknown): readonly RequestItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.price !== "number" && typeof item.price !== "string"
        || typeof item.sku !== "string" || typeof item.title !== "string") return [];
    return [{
      currentPrice: item.current_price === null || item.current_price === undefined ? null : Number(item.current_price).toFixed(2),
      currentStatus: typeof item.current_status === "string" ? item.current_status : null,
      price: Number(item.price).toFixed(2), sku: item.sku, title: item.title,
    }];
  });
}

export async function listPurchaseRequests(): Promise<readonly PurchaseRequestListItem[]> {
  if (!isLocalTransactionalRequestsEnabled()) return [];
  const result = await callAdminRpc<unknown>("admin_list_purchase_requests");
  if (!Array.isArray(result)) return [];
  return result.flatMap((row) => {
    if (!isRecord(row) || typeof row.id !== "string" || typeof row.public_reference !== "string"
        || typeof row.created_at !== "string" || typeof row.expires_at !== "string") return [];
    return [{
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      id: row.id,
      items: parseItems(row.items),
      publicReference: row.public_reference,
      subtotal: Number(row.merchandise_subtotal).toFixed(2),
    }];
  });
}

export async function getPurchaseRequest(requestId: string): Promise<DecryptedPurchaseRequest | null> {
  if (!isLocalTransactionalRequestsEnabled()) return null;
  const result = await callAdminRpc<unknown>("admin_get_purchase_request", { p_request_id: requestId });
  if (!isRecord(result) || typeof result.id !== "string" || typeof result.public_reference !== "string"
      || typeof result.created_at !== "string" || typeof result.expires_at !== "string"
      || typeof result.municipality_code !== "string" || (result.billing_type !== "cf" && result.billing_type !== "nit")) return null;
  return {
    billing: decryptFields(result.billing_ciphertext, result.id),
    accessEvents: (Array.isArray(result.access_events) ? result.access_events : []).flatMap((event) => isRecord(event) && typeof event.created_at === "string" && typeof event.purpose === "string" ? [{ createdAt: event.created_at, purpose: event.purpose }] : []),
    billingType: result.billing_type,
    contact: decryptFields(result.contact_ciphertext, result.id),
    createdAt: result.created_at,
    delivery: decryptFields(result.delivery_ciphertext, result.id),
    expiresAt: result.expires_at,
    id: result.id,
    items: parseItems(result.items),
    municipalityCode: result.municipality_code,
    publicReference: result.public_reference,
    subtotal: Number(result.merchandise_subtotal).toFixed(2),
  };
}

export type OrderListItem = Readonly<{
  createdAt: string;
  finalTotal: string | null;
  fulfillmentStatus: string;
  id: string;
  merchandiseSubtotal: string;
  paymentStatus: string;
  publicReference: string;
  shippingAmount: string | null;
  status: string;
}>;

export async function listOrders(): Promise<readonly OrderListItem[]> {
  if (!isLocalTransactionalRequestsEnabled()) return [];
  const result = await callAdminRpc<unknown>("admin_list_orders");
  if (!Array.isArray(result)) return [];
  return result.flatMap((row) => {
    if (!isRecord(row) || typeof row.id !== "string" || typeof row.public_reference !== "string"
        || typeof row.created_at !== "string") return [];
    return [{
      createdAt: row.created_at,
      finalTotal: row.final_total === null ? null : Number(row.final_total).toFixed(2),
      fulfillmentStatus: String(row.fulfillment_status),
      id: row.id,
      merchandiseSubtotal: Number(row.merchandise_subtotal).toFixed(2),
      paymentStatus: String(row.payment_status),
      publicReference: row.public_reference,
      shippingAmount: row.shipping_amount === null ? null : Number(row.shipping_amount).toFixed(2),
      status: String(row.status),
    }];
  });
}

export async function getOrder(orderId: string): Promise<Readonly<{
  billing: Readonly<Record<string, string>> | null;
  contact: Readonly<Record<string, string>> | null;
  delivery: Readonly<Record<string, string>> | null;
  events: readonly unknown[];
  dataAccessEvents: readonly AccessEvent[];
  fulfillmentStatus: string;
  id: string;
  shippingCoverageConfirmed: boolean;
  items: readonly Readonly<{ price: string; quantity: number; sku: string; title: string }>[];
  paymentStatus: string;
  payments: readonly Readonly<{ amount: string; linkReference: string | null; linkSentAt: string | null; provider: string; providerReference: string | null; status: string; verifiedAt: string | null }>[];
  incidents: readonly Readonly<{ createdAt: string; customerApproved: boolean; resolution: string | null; resolvedAt: string | null; status: string; verificationSource: string | null }>[];
  publicReference: string;
  status: string;
  subtotal: string;
  reservations: readonly Readonly<{ expiresAt: string; resolvedAt: string | null; status: string }>[];
  shippingAmount: string | null;
  finalTotal: string | null;
}> | null> {
  if (!isLocalTransactionalRequestsEnabled()) return null;
  const result = await callAdminRpc<unknown>("admin_get_order", { p_order_id: orderId });
  if (!isRecord(result) || typeof result.id !== "string" || typeof result.public_reference !== "string") return null;
  const readSnapshot = (snapshot: unknown): Readonly<Record<string, string>> | null => {
    if (!isRecord(snapshot) || !isRecord(snapshot.encrypted_fields) || typeof snapshot.encryption_context_id !== "string") return null;
    return decryptFields(snapshot.encrypted_fields, snapshot.encryption_context_id);
  };
  const itemRows = Array.isArray(result.items) ? result.items : [];
  const items = itemRows.flatMap((item) => {
    if (!isRecord(item) || typeof item.sku !== "string" || typeof item.title !== "string"
        || typeof item.price !== "number" && typeof item.price !== "string") return [];
    return [{ price: Number(item.price).toFixed(2), quantity: Number(item.quantity) === 1 ? 1 : 0, sku: item.sku, title: item.title }];
  }).filter((item) => item.quantity === 1);
  return {
    billing: readSnapshot(result.billing),
    contact: readSnapshot(result.contact),
    delivery: readSnapshot(result.delivery),
    events: Array.isArray(result.events) ? result.events : [],
    dataAccessEvents: (Array.isArray(result.data_access_events) ? result.data_access_events : []).flatMap((event) => isRecord(event) && typeof event.created_at === "string" && typeof event.purpose === "string" ? [{ createdAt: event.created_at, purpose: event.purpose }] : []),
    finalTotal: result.final_total === null ? null : Number(result.final_total).toFixed(2),
    fulfillmentStatus: String(result.fulfillment_status),
    id: result.id,
    shippingCoverageConfirmed: result.shipping_coverage_confirmed === true,
    items,
    paymentStatus: String(result.payment_status),
    payments: (Array.isArray(result.payments) ? result.payments : []).flatMap((payment) => {
      if (!isRecord(payment) || typeof payment.status !== "string" || typeof payment.provider !== "string") return [];
      return [{ amount: Number(payment.amount).toFixed(2), linkReference: typeof payment.payment_link_reference === "string" ? payment.payment_link_reference : null, linkSentAt: typeof payment.payment_link_sent_at === "string" ? payment.payment_link_sent_at : null, provider: payment.provider, providerReference: typeof payment.provider_reference === "string" ? payment.provider_reference : null, status: payment.status, verifiedAt: typeof payment.verified_at === "string" ? payment.verified_at : null }];
    }),
    incidents: (Array.isArray(result.incidents) ? result.incidents : []).flatMap((incident) => {
      if (!isRecord(incident) || typeof incident.status !== "string" || typeof incident.created_at !== "string") return [];
      return [{ createdAt: incident.created_at, customerApproved: incident.customer_approved === true, resolution: typeof incident.resolution === "string" ? incident.resolution : null, resolvedAt: typeof incident.resolved_at === "string" ? incident.resolved_at : null, status: incident.status, verificationSource: typeof incident.verification_source === "string" ? incident.verification_source : null }];
    }),
    publicReference: result.public_reference,
    reservations: (Array.isArray(result.reservations) ? result.reservations : []).flatMap((reservation) => {
      if (!isRecord(reservation) || typeof reservation.status !== "string" || typeof reservation.expires_at !== "string") return [];
      return [{ expiresAt: reservation.expires_at, resolvedAt: typeof reservation.resolved_at === "string" ? reservation.resolved_at : null, status: reservation.status }];
    }),
    shippingAmount: result.shipping_amount === null ? null : Number(result.shipping_amount).toFixed(2),
    status: String(result.status),
    subtotal: Number(result.merchandise_subtotal).toFixed(2),
  };
}
