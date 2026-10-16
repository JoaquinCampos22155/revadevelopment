"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { getCurrentAdminProfile } from "@/features/product-manager/server/admin-access";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { isTrustedRevaOrigin } from "@/infrastructure/config/site";
import { isLocalTransactionalRequestsEnabled } from "@/features/transactions/server/local-purchase-requests";

function validId(value: FormDataEntryValue | null): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function authorizedClient() {
  const requestHeaders = await headers();
  if (!isLocalTransactionalRequestsEnabled() || !isTrustedRevaOrigin(requestHeaders.get("origin")) || !await getCurrentAdminProfile()) return null;
  return createSupabaseServerClient();
}

async function performRpc(functionName: string, args: Record<string, unknown>) {
  const client = await authorizedClient();
  if (!client) return "unauthorized";
  const rpc = client.rpc.bind(client) as unknown as (name: string, parameters: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  const { error } = await rpc(functionName, args);
  if (!error) return "ok";
  if (["PRICE_REVIEW_REQUIRED", "PRODUCT_UNAVAILABLE", "REQUEST_EXPIRED_OR_MISSING", "RESERVATION_EXPIRED", "PAYMENT_AFTER_RESERVATION_EXPIRY", "ORDER_NOT_PAYABLE", "PAYMENT_ALREADY_PENDING", "PAYMENT_NOT_PREPARED", "OPEN_PAYMENT_INCIDENT_REQUIRED", "OPEN_PAYMENT_INCIDENT_EXISTS", "LATE_PAYMENT_REVIEW_REQUIRED", "ORDER_NOT_EXPIRED", "CUSTOMER_APPROVAL_REQUIRED", "ORDER_NOT_ELIGIBLE_FOR_DELETION", "DESTRUCTIVE_CONFIRMATION_REQUIRED"].includes(error.message)) return error.message;
  return "failed";
}

function refreshAdminViews() {
  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin/productos");
}

export async function discardPurchaseRequestAction(formData: FormData): Promise<void> {
  const requestId = formData.get("requestId");
  if (!validId(requestId) || formData.get("discardConfirmed") !== "yes") redirect("/admin/solicitudes?result=invalid");
  const status = await performRpc("admin_discard_purchase_request", { p_request_id: requestId });
  if (status === "ok") refreshAdminViews();
  redirect(`/admin/solicitudes?result=${status === "ok" ? "discarded" : status}`);
}

export async function approvePurchaseRequestAction(formData: FormData): Promise<void> {
  const requestId = formData.get("requestId");
  if (!validId(requestId) || formData.get("priceReconfirmed") !== "yes") redirect("/admin/solicitudes?result=review-required");
  const status = await performRpc("admin_approve_purchase_request", { p_request_id: requestId, p_customer_price_reviewed: true });
  if (status === "ok") refreshAdminViews();
  redirect(`/admin/solicitudes?result=${status === "ok" ? "approved" : status}`);
}

export async function setOrderShippingAction(formData: FormData): Promise<void> {
  const orderId = formData.get("orderId");
  const amount = formData.get("shippingAmount");
  if (!validId(orderId) || formData.get("shippingConfirmed") !== "yes" || typeof amount !== "string" || !/^\d{1,8}(?:\.\d{1,2})?$/.test(amount)) redirect("/admin/solicitudes?result=invalid");
  const status = await performRpc("admin_confirm_order_shipping", { p_order_id: orderId, p_shipping_amount: Number(amount), p_coverage_confirmed: true });
  if (status === "ok") refreshAdminViews();
  redirect(`/admin/solicitudes/ordenes/${orderId}?result=${status === "ok" ? "shipping-saved" : status}`);
}

export async function recordPaymentLinkSentAction(formData: FormData): Promise<void> {
  const orderId = formData.get("orderId");
  const reference = formData.get("paymentLinkReference");
  if (!validId(orderId) || formData.get("linkSentConfirmed") !== "yes" || (reference !== null && typeof reference !== "string")
      || typeof reference === "string" && (reference.trim().length > 120 || (reference.trim() !== "" && !/^[A-Za-z0-9_-]{1,120}$/.test(reference.trim())))) {
    redirect("/admin/solicitudes?result=confirmation-required");
  }
  const status = await performRpc("admin_record_payment_link_sent", { p_order_id: orderId, p_payment_link_reference: typeof reference === "string" && reference.trim() ? reference.trim() : null });
  if (status === "ok") refreshAdminViews();
  redirect(`/admin/solicitudes/ordenes/${orderId}?result=${status === "ok" ? "payment-link-recorded" : status}`);
}

export async function verifyOrderPaymentAction(formData: FormData): Promise<void> {
  const orderId = formData.get("orderId");
  const reference = formData.get("providerReference");
  if (!validId(orderId) || formData.get("verifiedDirectly") !== "yes" || typeof reference !== "string"
      || reference.trim().length < 1 || reference.trim().length > 120 || /[\u0000-\u001f\u007f]/.test(reference)) {
    redirect("/admin/solicitudes?result=verification-required");
  }
  const status = await performRpc("admin_verify_order_payment", { p_order_id: orderId, p_provider_reference: reference.trim() });
  if (status === "ok") refreshAdminViews();
  redirect(`/admin/solicitudes/ordenes/${orderId}?result=${status === "ok" ? "payment-verified" : status}`);
}

export async function cancelUnpaidOrderAction(formData: FormData): Promise<void> {
  const orderId = formData.get("orderId");
  if (!validId(orderId) || formData.get("cancelConfirmed") !== "yes") redirect("/admin/solicitudes?result=confirmation-required");
  const status = await performRpc("admin_cancel_unpaid_order", { p_order_id: orderId });
  if (status === "ok") refreshAdminViews();
  redirect(`/admin/solicitudes/ordenes/${orderId}?result=${status === "ok" ? "cancelled" : status}`);
}

export async function updateOrderFulfillmentAction(formData: FormData): Promise<void> {
  const orderId = formData.get("orderId");
  const nextStatus = formData.get("nextStatus");
  if (!validId(orderId) || typeof nextStatus !== "string" || !["preparing", "dispatched", "completed"].includes(nextStatus)) redirect("/admin/solicitudes?result=invalid");
  const status = await performRpc("admin_update_order_fulfillment", { p_order_id: orderId, p_next_status: nextStatus });
  if (status === "ok") refreshAdminViews();
  redirect(`/admin/solicitudes/ordenes/${orderId}?result=${status === "ok" ? "fulfillment-updated" : status}`);
}

export async function resolveLatePaymentAction(formData: FormData): Promise<void> {
  const orderId = formData.get("orderId");
  const resolution = formData.get("resolution");
  const reference = formData.get("providerReference");
  const customerApproved = formData.get("customerApproved") === "yes";
  if (!validId(orderId) || formData.get("verifiedDirectly") !== "yes"
      || typeof resolution !== "string" || !["confirmed_no_payment", "fulfilled_after_rereservation", "refund_coordinated", "customer_accepted_alternative"].includes(resolution)
      || (resolution !== "confirmed_no_payment" && (typeof reference !== "string" || !/^[A-Za-z0-9_-]{1,120}$/.test(reference.trim())))
      || (["refund_coordinated", "customer_accepted_alternative"].includes(resolution) && !customerApproved)) {
    redirect(`/admin/solicitudes/ordenes/${typeof orderId === "string" ? orderId : ""}?result=confirmation-required`);
  }
  const status = await performRpc("admin_resolve_late_payment", { p_order_id: orderId, p_resolution: resolution, p_provider_reference: typeof reference === "string" && reference.trim() ? reference.trim() : null, p_customer_approved: customerApproved });
  if (status === "ok") refreshAdminViews();
  redirect(`/admin/solicitudes/ordenes/${orderId}?result=${status === "ok" ? "late-payment-resolved" : status}`);
}

export async function openLatePaymentIncidentAction(formData: FormData): Promise<void> {
  const orderId = formData.get("orderId");
  if (!validId(orderId) || formData.get("latePaymentReported") !== "yes") redirect("/admin/solicitudes?result=confirmation-required");
  const status = await performRpc("admin_open_late_payment_incident", { p_order_id: orderId });
  if (status === "ok") refreshAdminViews();
  redirect(`/admin/solicitudes/ordenes/${orderId}?result=${status === "ok" ? "late-payment-opened" : status}`);
}

export async function deleteAbandonedOrderAction(formData: FormData): Promise<void> {
  const orderId = formData.get("orderId");
  if (!validId(orderId) || formData.get("deleteConfirmed") !== "yes") redirect("/admin/solicitudes?result=confirmation-required");
  const status = await performRpc("admin_delete_abandoned_order", { p_order_id: orderId, p_destructive_confirmed: true });
  if (status === "ok") refreshAdminViews();
  redirect(status === "ok" ? "/admin/solicitudes?result=abandoned-data-deleted" : `/admin/solicitudes/ordenes/${orderId}?result=${status}`);
}
