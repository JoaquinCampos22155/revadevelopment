import test from "node:test";
import assert from "node:assert/strict";

import {
  formatAdminDeliveryAddress,
  getSpanishOrderEvent,
  getSpanishIncidentResolution,
  getSpanishReservationStatus,
  getAdminWhatsAppUrl,
  getAdminOrderTotalDisplay,
  getSpanishOrderStatus,
  getAdminStatusTone,
  getAdminPaginationPages,
  normalizeAdminPurchaseRequestListFilters,
  normalizeAdminOrderListFilters,
  parseAdminListPage,
} from "../src/features/transactions/transactional-admin-presentation.ts";

test("Order address displays municipality before the approved address components", () => {
  assert.equal(formatAdminDeliveryAddress("Mixco", {
    street: "Calzada Roosevelt",
    house_number: "12-34",
    apartment: "Edificio Norte",
    neighborhood: "Colonia Las Flores",
    zone: "8",
    reference: "Portón azul",
  }), "Municipio: Mixco · Calle/avenida: Calzada Roosevelt · Casa/lote: 12-34 · Apartamento/edificio: Edificio Norte · Colonia/residencial: Colonia Las Flores · Zona: 8 · Referencia: Portón azul");
});

test("Order states use Spanish labels and unknown states fail closed", () => {
  assert.equal(getSpanishOrderStatus("payment", "verified_manual"), "Verificado manualmente");
  assert.equal(getSpanishOrderStatus("fulfillment", "dispatched"), "Despachada");
  assert.equal(getSpanishOrderStatus("order", "unrecognized"), "Estado no reconocido");
  assert.equal(getSpanishOrderEvent("reservation_expired"), "Reserva expirada");
  assert.equal(getSpanishOrderEvent("unknown_internal_event"), "Actualización operativa registrada");
  assert.equal(getSpanishIncidentResolution("refund_coordinated"), "Devolución coordinada manualmente");
  assert.equal(getSpanishReservationStatus("active"), "Activa");
});

test("Admin operational status tones distinguish attention, progress, completion, and neutral states", () => {
  assert.equal(getAdminStatusTone("order", "pending_payment"), "attention");
  assert.equal(getAdminStatusTone("payment", "late_unverified"), "exception");
  assert.equal(getAdminStatusTone("payment", "verified_manual"), "confirmed");
  assert.equal(getAdminStatusTone("fulfillment", "preparing"), "progress");
  assert.equal(getAdminStatusTone("fulfillment", "completed"), "confirmed");
  assert.equal(getAdminStatusTone("payment", "cancelled"), "neutral");
  assert.equal(getAdminStatusTone("payment", "unrecognized"), "neutral");
});

test("cancelled Orders without a final total do not imply delivery is still pending", () => {
  assert.equal(getAdminOrderTotalDisplay(null, "cancelled"), "Total no confirmado");
  assert.equal(getAdminOrderTotalDisplay(null, "pending_payment"), "Entrega pendiente");
  assert.equal(getAdminOrderTotalDisplay("125.00", "cancelled"), "Q 125.00");
});

test("Admin WhatsApp link opens contact selection without putting buyer phone in the URL", () => {
  const link = getAdminWhatsAppUrl("REVA-ABCDEF123456");
  assert.ok(link);
  const url = new URL(link);
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/");
  assert.equal(url.searchParams.get("text"), "Hola, doy seguimiento a tu solicitud de compra en REVA. Referencia: REVA-ABCDEF123456");
  const currentReference = "REVA-0123456789ABCDEF0123456789ABCDEF";
  assert.ok(getAdminWhatsAppUrl(currentReference));
  assert.equal(link.includes("50255551234"), false);
  assert.equal(getAdminWhatsAppUrl("internal-uuid"), null);
});

test("request list filters normalize reference, valid status, ordering, and bounded page", () => {
  assert.deepEqual(normalizeAdminPurchaseRequestListFilters({
    search: " reva-abcdef000001 ", status: "pending_review", dateOrder: "oldest", page: "2",
  }), {
    search: "REVA-ABCDEF000001", status: "pending_review", dateOrder: "oldest", page: "2",
  });
  assert.deepEqual(normalizeAdminPurchaseRequestListFilters({
    search: "%_unsafe", status: "expired", dateOrder: "sideways", page: "999999999999",
  }), { search: "", status: "all", dateOrder: "newest", page: "1" });
  const fullReference = "REVA-0123456789ABCDEF0123456789ABCDEF";
  assert.equal(normalizeAdminPurchaseRequestListFilters({ search: fullReference }).search, fullReference);
  assert.equal(normalizeAdminOrderListFilters({ search: fullReference }).search, fullReference);
  assert.equal(normalizeAdminPurchaseRequestListFilters({ search: "A".repeat(64) }).search, "A".repeat(64));
  assert.equal(normalizeAdminOrderListFilters({ search: "A".repeat(64) }).search, "A".repeat(64));
  assert.equal(normalizeAdminPurchaseRequestListFilters({ search: "A".repeat(65) }).search, "");
  assert.equal(normalizeAdminOrderListFilters({ search: "A".repeat(65) }).search, "");
  assert.equal(normalizeAdminPurchaseRequestListFilters({ search: "REVA-0123;DROP" }).search, "");
});

test("Admin list RPC envelope rejects inconsistent counts or rows", () => {
  const parseRow = (value) => typeof value === "string" ? value : null;
  assert.deepEqual(parseAdminListPage({
    items: ["REVA-000000000001"], page: 2, page_count: 3, page_size: 20, total_count: 45,
  }, parseRow), {
    items: ["REVA-000000000001"], page: 2, pageCount: 3, pageSize: 20, totalCount: 45,
  });
  assert.equal(parseAdminListPage({
    items: ["REVA-000000000001"], page: 4, page_count: 3, page_size: 20, total_count: 45,
  }, parseRow), null);
  assert.equal(parseAdminListPage({
    items: ["REVA-000000000001", { unexpected: true }], page: 1, page_count: 1, page_size: 20, total_count: 2,
  }, parseRow), null);
  assert.equal(parseAdminListPage({
    items: ["a", "b"], page: 1, page_count: 1, page_size: 1, total_count: 2,
  }, parseRow), null);
});

test("Order list filters remain within server RPC allowlists", () => {
  assert.deepEqual(normalizeAdminOrderListFilters({
    search: " reva-000000000001 ", status: "cancelled", payment: "late_unverified",
    fulfillment: "completed", dateOrder: "oldest", page: "3",
  }), {
    search: "REVA-000000000001", status: "cancelled", payment: "late_unverified",
    fulfillment: "completed", dateOrder: "oldest", page: "3",
  });
  assert.equal(normalizeAdminOrderListFilters({ search: "REVA-XYZ;DROP", status: "all", payment: "all", fulfillment: "all", dateOrder: "newest", page: "1" }).search, "");
  assert.equal(normalizeAdminOrderListFilters({ payment: "verified" }).payment, "verified");
});

test("Admin pagination keeps a compact window for large result sets", () => {
  assert.deepEqual(getAdminPaginationPages(8, 40), [1, "ellipsis", 7, 8, 9, "ellipsis", 40]);
  assert.deepEqual(getAdminPaginationPages(2, 3), [1, 2, 3]);
  assert.deepEqual(getAdminPaginationPages(1, 0), []);
});
