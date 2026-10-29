import "server-only";

import { decryptSensitiveValue, loadTransactionalKeyrings, type EncryptedSensitiveValue } from "@/features/transactions/server/encryption";
import { isLocalTransactionalRequestsEnabled } from "@/features/transactions/server/local-purchase-requests";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { SupabaseStorageService } from "@/infrastructure/supabase/supabase-storage.service";
import {
  parseAdminListPage,
  type AdminListPage,
  type AdminOrderListFilters,
  type AdminPurchaseRequestListFilters,
} from "@/features/transactions/transactional-admin-presentation";

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
  productCount: number;
  publicReference: string;
  status: string;
  subtotal: string;
}>;

export type DecryptedPurchaseRequest = Omit<PurchaseRequestListItem, "productCount" | "status"> & Readonly<{
  billing: Readonly<Record<string, string>>;
  billingType: "cf" | "nit";
  contact: Readonly<Record<string, string>>;
  delivery: Readonly<Record<string, string>>;
  accessEvents: readonly AccessEvent[];
  items: readonly RequestItem[];
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

function moneyString(value: unknown): string | null {
  const amount = typeof value === "number" || typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(amount) && amount >= 0 ? amount.toFixed(2) : null;
}

function parsePurchaseRequestListItem(value: unknown): PurchaseRequestListItem | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.public_reference !== "string"
      || typeof value.created_at !== "string" || typeof value.expires_at !== "string"
      || !Number.isInteger(value.product_count) || (value.product_count as number) < 0
      || value.status !== "pending_review") return null;
  const subtotal = moneyString(value.merchandise_subtotal);
  if (subtotal === null) return null;
  return {
    createdAt: value.created_at,
    expiresAt: value.expires_at,
    id: value.id,
    productCount: value.product_count as number,
    publicReference: value.public_reference,
    status: value.status,
    subtotal,
  };
}

function pageNumber(page: string): number {
  const value = Number(page);
  return Number.isInteger(value) && value >= 1 && value <= 100000 ? value : 1;
}

export async function listPurchaseRequests(filters: AdminPurchaseRequestListFilters): Promise<AdminListPage<PurchaseRequestListItem>> {
  if (!isLocalTransactionalRequestsEnabled()) return { items: [], page: 1, pageCount: 0, pageSize: 20, totalCount: 0 };
  const result = await callAdminRpc<unknown>("admin_list_purchase_requests_v2", {
    p_page: pageNumber(filters.page), p_page_size: 20, p_search: filters.search,
    p_status: filters.status, p_date_order: filters.dateOrder,
  });
  const parsed = parseAdminListPage(result, parsePurchaseRequestListItem);
  if (!parsed) throw new Error("Transactional admin data is unavailable.");
  return parsed;
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
  productCount: number;
  merchandiseSubtotal: string;
  paymentStatus: string;
  publicReference: string;
  shippingAmount: string | null;
  status: string;
  thumbnail: Readonly<{ altText: string | null; height: number | null; imageId: string; url: string; width: number | null }> | null;
}>;

function parseOrderListItem(value: unknown): Omit<OrderListItem, "thumbnail"> & Readonly<{ thumbnail: Readonly<{ altText: string | null; height: number | null; imageId: string; width: number | null }> | null }> | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.public_reference !== "string"
      || typeof value.created_at !== "string" || typeof value.status !== "string"
      || typeof value.payment_status !== "string" || typeof value.fulfillment_status !== "string"
      || !Number.isInteger(value.product_count) || (value.product_count as number) < 0) return null;
  const merchandiseSubtotal = moneyString(value.merchandise_subtotal);
  const finalTotal = value.final_total === null ? null : moneyString(value.final_total);
  const shippingAmount = value.shipping_amount === null ? null : moneyString(value.shipping_amount);
  if (merchandiseSubtotal === null || (value.final_total !== null && finalTotal === null)
      || (value.shipping_amount !== null && shippingAmount === null)) return null;
  let thumbnail: Readonly<{ altText: string | null; height: number | null; imageId: string; width: number | null }> | null = null;
  if (isRecord(value.product_thumbnail) && typeof value.product_thumbnail.image_id === "string"
      && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(value.product_thumbnail.image_id)) {
    const width = Number.isInteger(value.product_thumbnail.width) && (value.product_thumbnail.width as number) > 0 ? value.product_thumbnail.width as number : null;
    const height = Number.isInteger(value.product_thumbnail.height) && (value.product_thumbnail.height as number) > 0 ? value.product_thumbnail.height as number : null;
    thumbnail = { altText: typeof value.product_thumbnail.alt_text === "string" ? value.product_thumbnail.alt_text : null, height, imageId: value.product_thumbnail.image_id, width };
  }
  return {
    createdAt: value.created_at, finalTotal, fulfillmentStatus: value.fulfillment_status,
    id: value.id, merchandiseSubtotal, paymentStatus: value.payment_status,
    productCount: value.product_count as number, publicReference: value.public_reference,
    shippingAmount, status: value.status, thumbnail,
  };
}

export async function listOrders(filters: AdminOrderListFilters): Promise<AdminListPage<OrderListItem>> {
  if (!isLocalTransactionalRequestsEnabled()) return { items: [], page: 1, pageCount: 0, pageSize: 20, totalCount: 0 };
  const page = pageNumber(filters.page);
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("admin_list_orders_v2" as never, {
    p_page: page, p_page_size: 20, p_search: filters.search, p_order_status: filters.status,
    p_payment_status: filters.payment, p_fulfillment_status: filters.fulfillment, p_date_order: filters.dateOrder,
  } as never);
  if (error) throw new Error("Transactional admin data is unavailable.");
  const parsed = parseAdminListPage(data, parseOrderListItem);
  if (!parsed) throw new Error("Transactional admin data is unavailable.");
  const storage = new SupabaseStorageService(client);
  return {
    ...parsed,
    items: parsed.items.map(({ thumbnail, ...order }) => ({
      ...order,
      thumbnail: thumbnail ? { ...thumbnail, url: storage.createPublicProductImageUrl(thumbnail.imageId) } : null,
    })),
  };
}

export async function getOrder(orderId: string): Promise<Readonly<{
  billing: Readonly<Record<string, string>> | null;
  contact: Readonly<Record<string, string>> | null;
  delivery: (Readonly<Record<string, string>> & Readonly<{ municipalityCode: string }>) | null;
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
  const deliveryFields = readSnapshot(result.delivery);
  const municipalityCode = isRecord(result.delivery) && typeof result.delivery.municipality_code === "string"
    ? result.delivery.municipality_code
    : "";
  const items = itemRows.flatMap((item) => {
    if (!isRecord(item) || typeof item.sku !== "string" || typeof item.title !== "string"
        || typeof item.price !== "number" && typeof item.price !== "string") return [];
    return [{ price: Number(item.price).toFixed(2), quantity: Number(item.quantity) === 1 ? 1 : 0, sku: item.sku, title: item.title }];
  }).filter((item) => item.quantity === 1);
  return {
    billing: readSnapshot(result.billing),
    contact: readSnapshot(result.contact),
    delivery: deliveryFields ? { ...deliveryFields, municipalityCode } : null,
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
