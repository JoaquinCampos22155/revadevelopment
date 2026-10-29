type DeliveryAddress = Readonly<Record<string, string | undefined>>;

export type AdminOrderListRow = Readonly<{
  createdAt: string;
  finalTotal: string | null;
  fulfillmentStatus: string;
  id: string;
  productCount: number;
  thumbnail: Readonly<{ altText: string | null; height: number | null; imageId: string; width: number | null }> | null;
  merchandiseSubtotal: string;
  paymentStatus: string;
  publicReference: string;
  shippingAmount: string | null;
  status: string;
}>;

export type AdminOrderListFilters = Readonly<{
  dateOrder: "newest" | "oldest";
  fulfillment: string;
  page: string;
  payment: string;
  search: string;
  status: string;
}>;

export type AdminPurchaseRequestListFilters = Readonly<{
  dateOrder: "newest" | "oldest";
  page: string;
  search: string;
  status: "all" | "pending_review";
}>;

export type AdminListPage<T> = Readonly<{
  items: readonly T[];
  page: number;
  pageCount: number;
  pageSize: number;
  totalCount: number;
}>;

const ORDER_STATES = new Set(["pending_payment", "paid", "fulfilling", "completed", "cancelled", "expired"]);
const PAYMENT_STATES = new Set(["not_started", "pending", "verified", "expired", "cancelled", "pending_manual", "verified_manual", "late_unverified"]);
const FULFILLMENT_STATES = new Set(["not_ready", "ready", "preparing", "dispatched", "completed", "cancelled"]);

function allowedFilter(value: string | undefined, known: ReadonlySet<string>): string {
  return value && known.has(value) ? value : "all";
}

function normalizedReference(value: string | undefined): string {
  const candidate = (value ?? "").trim().toUpperCase();
  return candidate.length <= 32 && /^[A-Z0-9-]*$/.test(candidate) ? candidate : "";
}

export function parseAdminListPage<T>(value: unknown, parseItem: (item: unknown) => T | null): AdminListPage<T> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const { items, page, page_count: pageCount, page_size: pageSize, total_count: totalCount } = record;
  if (!Array.isArray(items) || !Number.isInteger(page) || !Number.isInteger(pageCount)
      || !Number.isInteger(pageSize) || !Number.isInteger(totalCount)
      || (page as number) < 1 || (pageCount as number) < 0 || (pageSize as number) < 1 || (pageSize as number) > 50
      || (totalCount as number) < 0 || (pageCount as number) !== Math.ceil((totalCount as number) / (pageSize as number))
      || items.length > (pageSize as number)
      || (pageCount as number) === 0 && ((page as number) !== 1 || items.length !== 0)
      || (pageCount as number) > 0 && (page as number) > (pageCount as number)) return null;
  const parsed = items.map(parseItem);
  if (parsed.some((item) => item === null)) return null;
  return { items: parsed as T[], page: page as number, pageCount: pageCount as number, pageSize: pageSize as number, totalCount: totalCount as number };
}

export function normalizeAdminPurchaseRequestListFilters(
  input: Readonly<Record<string, string | undefined>>,
): AdminPurchaseRequestListFilters {
  return {
    dateOrder: input.dateOrder === "oldest" ? "oldest" : "newest",
    page: input.page && /^\d{1,6}$/.test(input.page) && Number(input.page) >= 1 && Number(input.page) <= 100000 ? String(Number(input.page)) : "1",
    search: normalizedReference(input.search),
    status: input.status === "pending_review" ? "pending_review" : "all",
  };
}

export function parseAdminListPageNumber(value: string | undefined, maxPage = 100000): number {
  const parsed = value && /^\d{1,6}$/.test(value) ? Number(value) : 1;
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= maxPage ? parsed : 1;
}

export function getAdminPaginationPages(currentPage: number, pageCount: number): readonly (number | "ellipsis")[] {
  if (!Number.isInteger(currentPage) || !Number.isInteger(pageCount) || pageCount < 1) return [];
  const current = Math.min(Math.max(currentPage, 1), pageCount);
  const candidates = new Set([1, pageCount, current - 1, current, current + 1]);
  const ordered = [...candidates].filter((page) => page >= 1 && page <= pageCount).sort((left, right) => left - right);
  return ordered.flatMap((page, index) => index > 0 && page - ordered[index - 1] > 1 ? ["ellipsis", page] : [page]);
}

export function normalizeAdminOrderListFilters(input: Readonly<Record<string, string | undefined>>): AdminOrderListFilters {
  return {
    dateOrder: input.dateOrder === "oldest" ? "oldest" : "newest",
    fulfillment: allowedFilter(input.fulfillment, FULFILLMENT_STATES),
    page: input.page && /^\d{1,6}$/.test(input.page) && Number(input.page) >= 1 && Number(input.page) <= 100000 ? String(Number(input.page)) : "1",
    payment: allowedFilter(input.payment, PAYMENT_STATES),
    search: normalizedReference(input.search),
    status: allowedFilter(input.status, ORDER_STATES),
  };
}

const ORDER_STATUS_LABELS: Readonly<Record<string, string>> = {
  cancelled: "Cancelada",
  completed: "Completada",
  expired: "Expirada",
  fulfilling: "En preparación",
  paid: "Pagada",
  pending_payment: "Pendiente de pago",
};

const PAYMENT_STATUS_LABELS: Readonly<Record<string, string>> = {
  cancelled: "Cancelado",
  expired: "Expirado",
  late_unverified: "Pago tardío sin verificar",
  not_started: "No iniciado",
  pending: "Pendiente",
  pending_manual: "Pendiente de verificación manual",
  verified: "Verificado",
  verified_manual: "Verificado manualmente",
};

const FULFILLMENT_STATUS_LABELS: Readonly<Record<string, string>> = {
  cancelled: "Cancelada",
  completed: "Completada",
  dispatched: "Despachada",
  not_ready: "Aún no preparada",
  preparing: "En preparación",
  ready: "Lista para despacho",
};

const ORDER_EVENT_LABELS: Readonly<Record<string, string>> = {
  approved: "Solicitud aprobada y orden creada",
  cancelled: "Orden cancelada",
  fulfillment_changed: "Estado de preparación actualizado",
  payment_incident_opened: "Incidencia de pago tardío abierta",
  payment_incident_resolved: "Incidencia de pago tardío resuelta",
  payment_link_sent: "Enlace manual registrado como enviado",
  payment_verified: "Pago verificado manualmente",
  reservation_expired: "Reserva expirada",
  shipping_confirmed: "Cobertura y costo de entrega confirmados",
  order_data_deleted: "Datos operativos de la orden eliminados",
};

const INCIDENT_RESOLUTION_LABELS: Readonly<Record<string, string>> = {
  confirmed_no_payment: "Recurrente confirmó que no hubo pago",
  customer_accepted_alternative: "Alternativa aceptada por el cliente",
  fulfilled_after_rereservation: "Orden cumplida tras revalidar y reservar de nuevo",
  refund_coordinated: "Devolución coordinada manualmente",
};

const RESERVATION_STATUS_LABELS: Readonly<Record<string, string>> = {
  active: "Activa",
  consumed: "Consumida",
  expired: "Expirada",
  released: "Liberada",
};

/** Formats only the fields intended for the authorized Admin delivery view. */
export function formatAdminDeliveryAddress(municipality: string | null, address: DeliveryAddress): string {
  const entries: readonly [string, string | undefined][] = [
    ["Municipio", municipality || "No identificado"],
    ["Calle/avenida", address.street],
    ["Casa/lote", address.house_number],
    ["Apartamento/edificio", address.apartment],
    ["Colonia/residencial", address.neighborhood],
    ["Zona", address.zone],
    ["Referencia", address.reference],
  ];
  return entries
    .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
    .map(([label, value]) => `${label}: ${value!.trim()}`)
    .join(" · ");
}

export function getSpanishOrderStatus(kind: "order" | "payment" | "fulfillment", status: string): string {
  const labels = kind === "order" ? ORDER_STATUS_LABELS : kind === "payment" ? PAYMENT_STATUS_LABELS : FULFILLMENT_STATUS_LABELS;
  return labels[status] ?? "Estado no reconocido";
}

export function getAdminOrderTotalDisplay(finalTotal: string | null, orderStatus: string): string {
  if (finalTotal !== null) return `Q ${finalTotal}`;
  return orderStatus === "cancelled" ? "Total no confirmado" : "Entrega pendiente";
}

export type AdminStatusTone = "attention" | "confirmed" | "exception" | "neutral" | "progress";

/** Maps existing operational states to restrained visual emphasis; it does not define transitions. */
export function getAdminStatusTone(kind: "order" | "payment" | "fulfillment", status: string): AdminStatusTone {
  if (kind === "order") {
    if (status === "pending_payment") return "attention";
    if (status === "fulfilling") return "progress";
    if (status === "paid" || status === "completed") return "confirmed";
    return "neutral";
  }

  if (kind === "payment") {
    if (status === "pending" || status === "pending_manual") return "attention";
    if (status === "late_unverified" || status === "expired") return "exception";
    if (status === "verified" || status === "verified_manual") return "confirmed";
    return "neutral";
  }

  if (status === "not_ready") return "attention";
  if (status === "ready" || status === "preparing" || status === "dispatched") return "progress";
  if (status === "completed") return "confirmed";
  return "neutral";
}

export function getSpanishOrderEvent(eventType: string): string {
  return ORDER_EVENT_LABELS[eventType] ?? "Actualización operativa registrada";
}

export function getSpanishIncidentResolution(resolution: string): string {
  return INCIDENT_RESOLUTION_LABELS[resolution] ?? "Resolución no reconocida";
}

export function getSpanishReservationStatus(status: string): string {
  return RESERVATION_STATUS_LABELS[status] ?? "Estado no reconocido";
}

/** Opens WhatsApp's contact picker with a non-sensitive reference and no buyer phone in the URL. */
export function getAdminWhatsAppUrl(publicReference: string): string | null {
  const reference = /^REVA-[A-F0-9]{12}$/.test(publicReference) ? publicReference : null;
  if (!reference) return null;

  const message = `Hola, doy seguimiento a tu solicitud de compra en REVA. Referencia: ${reference}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
