import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

import { decryptSensitiveValue, encryptSensitiveValue } from "../src/features/transactions/server/encryption.ts";
import { assertLocalSupabaseEndpoints } from "./local-transactional-qa.mjs";

const localDirectory = path.join(process.env.LOCALAPPDATA ?? path.join(homedir(), "AppData", "Local"), "REVA", "transactional-qa");
const lastFlowPath = path.join(localDirectory, "last-flow.json");
const pnpmEntrypoint = path.join(path.dirname(process.execPath), "node_modules", "corepack", "dist", "pnpm.js");
const checks = [];

function record(name, condition, safeDetail = "") {
  assert.ok(condition, `${name}${safeDetail ? `: ${safeDetail}` : ""}`);
  checks.push(name);
  console.log(`PASS ${name}`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.error || result.status !== 0) throw new Error(`A local-only transactional QA prerequisite failed (${result.error?.code ?? result.status ?? "unknown"}): ${(result.stderr ?? "").slice(0, 200)}`);
  return result.stdout;
}

function getSupabaseStatus() {
  const output = run(process.execPath, [pnpmEntrypoint, "exec", "supabase", "status", "--output", "json"]);
  const jsonStart = output.indexOf("{");
  if (jsonStart < 0) throw new Error("Local Supabase is not running.");
  const status = JSON.parse(output.slice(jsonStart));
  assertLocalSupabaseEndpoints({ apiUrl: status.API_URL, databaseUrl: status.DB_URL });
  return { apiUrl: status.API_URL, publishableKey: status.PUBLISHABLE_KEY, serviceRoleKey: status.SERVICE_ROLE_KEY };
}

function adminDatabaseCommand(query) {
  if (!/^[\s\S]+$/.test(query)) throw new Error("Invalid local QA database statement.");
  return run("docker", ["exec", "supabase_db_revadevelopment", "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-At", "-c", query]);
}

async function signIn(apiUrl, publishableKey, identity) {
  const client = createClient(apiUrl, publishableKey, { auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email: identity.email, password: identity.password });
  if (error || !data.user) throw new Error("A local synthetic identity could not sign in.");
  return { client, userId: data.user.id };
}

function encryptFields(values, requestId, key) {
  const keyring = new Map([[1, key]]);
  return Object.fromEntries(Object.entries(values).map(([field, value]) => [field, encryptSensitiveValue(
    value,
    { field, recordId: requestId, recordType: "purchase_request" },
    keyring,
    1,
  )]));
}

function digestCandidates(keyring, purpose, value) {
  return [...keyring.entries()].sort(([left], [right]) => left - right).map(([version, key]) => ({
    digest: createHmac("sha256", key).update(`${purpose}:${value}`).digest("hex"),
    version,
  }));
}

async function createRequest(serviceClient, keyring, hmacKeyring, fixture, { userId = null, expectedPrice = fixture.price, keyId = randomUUID(), fingerId = randomUUID() } = {}) {
  const id = randomUUID();
  const encryptionKey = keyring.get(1);
  if (!encryptionKey) throw new Error("Local test encryption keyring is missing its active key.");
  const fixtures = Array.isArray(fixture) ? fixture : [fixture];
  const data = {
    p_request_id: id,
    p_slugs: fixtures.map((item) => item.slug),
    p_expected_items: fixtures.map((item) => ({ slug: item.slug, price: item === fixture ? expectedPrice : item.price })),
    p_contact_ciphertext: encryptFields({ email: "qa.customer@example.test", first_name: "QA Persona", last_name: "Ficticia", phone: "55551234" }, id, encryptionKey),
    p_delivery_ciphertext: encryptFields({ apartment: "", house_number: "Lote QA 1", neighborhood: "Zona de prueba", reference: "Dato sintético", street: "Calle de prueba", zone: "Zona 1" }, id, encryptionKey),
    p_municipality_code: "0101",
    p_billing_type: "cf",
    p_billing_ciphertext: encryptFields({ nit: "", recipient_name: "" }, id, encryptionKey),
    p_idempotency_digest: `\\x${digestCandidates(hmacKeyring, "idempotency", keyId).find(({ version }) => version === 1)?.digest}`,
    p_idempotency_candidates: digestCandidates(hmacKeyring, "idempotency", keyId),
    p_fingerprint_digest: `\\x${digestCandidates(hmacKeyring, "rate-limit", fingerId).find(({ version }) => version === 1)?.digest}`,
    p_fingerprint_candidates: digestCandidates(hmacKeyring, "rate-limit", fingerId),
    p_user_id: userId,
    p_key_version: 1,
    p_hmac_key_version: 1,
  };
  return { id, result: await serviceClient.rpc("create_purchase_request", data), data };
}

async function setRequestExpired(requestId) {
  assert.match(requestId, /^[0-9a-f-]{36}$/i);
  adminDatabaseCommand(`update private.purchase_requests set created_at = now() - interval '25 hours', expires_at = now() - interval '1 hour' where id = '${requestId}';`);
}

async function setReservationExpired(orderId) {
  assert.match(orderId, /^[0-9a-f-]{36}$/i);
  adminDatabaseCommand(`update private.inventory_reservations set expires_at = now() - interval '1 second' where order_id = '${orderId}' and status = 'active';`);
}

async function verifyAdminAfterRestart() {
  const status = getSupabaseStatus();
  const credentials = JSON.parse(await readFile(path.join(localDirectory, "credentials.json"), "utf8"));
  const evidence = JSON.parse(await readFile(lastFlowPath, "utf8"));
  const cookieJar = new Map();
  const adminSession = createServerClient(status.apiUrl, status.publishableKey, {
    cookies: {
      getAll: () => [...cookieJar.entries()].map(([name, value]) => ({ name, value })),
      setAll: (cookies) => cookies.forEach(({ name, value }) => cookieJar.set(name, value)),
    },
  });
  const { error: signInError } = await adminSession.auth.signInWithPassword(credentials.admin);
  if (signInError || cookieJar.size === 0) throw new Error("Could not establish the local synthetic admin session for post-restart verification.");
  const cookie = [...cookieJar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
  const headers = { cookie };
  const listResponse = await fetch("http://127.0.0.1:3000/admin/solicitudes", { headers, redirect: "manual" });
  record("authenticated synthetic admin can open Gestión → Solicitudes y órdenes after restart", listResponse.status === 200);
  const detailResponse = await fetch(`http://127.0.0.1:3000/admin/solicitudes/${evidence.requestId}`, { headers, redirect: "manual" });
  const html = await detailResponse.text();
  record("server-side decryption still renders the pending synthetic request after restart", detailResponse.status === 200 && html.includes("QA Persona") && html.includes("55551234"));
  const ordersPageResponse = await fetch("http://127.0.0.1:3000/admin/solicitudes", { headers, redirect: "manual" });
  const ordersPageHtml = await ordersPageResponse.text();
  const normalizedOrdersPageHtml = ordersPageHtml.replace(/<!--.*?-->/g, "");
  record("authorized synthetic admin sees the local Order and its current payment/fulfillment statuses", ordersPageResponse.status === 200 && normalizedOrdersPageHtml.includes(evidence.orderPublicReference));
  const orderDetailResponse = await fetch(`http://127.0.0.1:3000/admin/solicitudes/ordenes/${evidence.orderId}`, { headers, redirect: "manual" });
  const orderDetailHtml = (await orderDetailResponse.text()).replace(/<!--.*?-->/g, "");
  record("authorized synthetic admin can inspect encrypted Order details and the coverage/payment workflow", orderDetailResponse.status === 200 && orderDetailHtml.includes("Estado:") && orderDetailHtml.includes("pending_payment") && orderDetailHtml.includes("Costo de entrega confirmado con el cliente") && orderDetailHtml.includes("Datos personales · acceso administrativo"));
  const productManagerResponse = await fetch("http://127.0.0.1:3000/admin/productos", { headers, redirect: "manual" });
  record("authorized synthetic admin retains Product Manager access", productManagerResponse.status === 200);

  const customerCookieJar = new Map();
  const customerSsr = createServerClient(status.apiUrl, status.publishableKey, {
    cookies: {
      getAll: () => [...customerCookieJar.entries()].map(([name, value]) => ({ name, value })),
      setAll: (cookies) => cookies.forEach(({ name, value }) => customerCookieJar.set(name, value)),
    },
  });
  const { error: customerSsrSignInError } = await customerSsr.auth.signInWithPassword(credentials.customer);
  if (customerSsrSignInError) throw new Error("Could not establish the local synthetic customer SSR session.");
  const customerCookie = [...customerCookieJar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
  const customerListResponse = await fetch("http://127.0.0.1:3000/admin/solicitudes", { headers: { cookie: customerCookie }, redirect: "manual" });
  record("authenticated customer is redirected away from the Admin requests list", customerListResponse.status === 307 && customerListResponse.headers.get("location") === "/");
  const customerResponse = await fetch(`http://127.0.0.1:3000/admin/solicitudes/${evidence.requestId}`, { headers: { cookie: customerCookie }, redirect: "manual" });
  record("authenticated customer is redirected away from private admin request details", customerResponse.status === 307 && customerResponse.headers.get("location") === "/");
  const customerProductManagerResponse = await fetch("http://127.0.0.1:3000/admin/productos", { headers: { cookie: customerCookie }, redirect: "manual" });
  record("authenticated customer remains blocked from Product Manager", customerProductManagerResponse.status === 307 && customerProductManagerResponse.headers.get("location") === "/");
}

async function main() {
  if (process.argv[2] === "verify-after-restart") return verifyAdminAfterRestart();
  const status = getSupabaseStatus();
  const credentials = JSON.parse(await readFile(path.join(localDirectory, "credentials.json"), "utf8"));
  const manifest = JSON.parse(await readFile(path.join(localDirectory, "fixtures.json"), "utf8"));
  const key = Buffer.from((await readFile(path.join(localDirectory, "encryption-key-v1.txt"), "utf8")).trim(), "base64url");
  const hmacKey = Buffer.from((await readFile(path.join(localDirectory, "hmac-key-v1.txt"), "utf8")).trim(), "base64url");
  if (key.byteLength !== 32 || hmacKey.byteLength !== 32 || key.equals(hmacKey) || !Array.isArray(manifest.products) || manifest.products.length !== 6) throw new Error("Local QA state is missing or invalid.");
  const keyring = new Map([[1, key]]);
  const hmacKeyring = new Map([[1, hmacKey]]);
  const products = Object.fromEntries(manifest.products.map((product) => [product.scenario.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), product]));
  const serviceClient = createClient(status.apiUrl, status.serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const catalogResponse = await fetch("http://127.0.0.1:3000/catalogo");
  const catalogHtml = await catalogResponse.text();
  const syntheticImageTag = [...catalogHtml.matchAll(/<img\b[^>]*>/g)].find(([tag]) => tag.includes("Ilustración sintética"))?.[0];
  const renderedImageSource = syntheticImageTag?.match(/\bsrc="([^"]+)"/)?.[1]?.replaceAll("&amp;", "&");
  const renderedImageUrl = renderedImageSource ? new URL(renderedImageSource, "http://127.0.0.1:3000") : null;
  const renderedImageResponse = renderedImageUrl ? await fetch(renderedImageUrl) : null;
  record(
    "Catalog renders synthetic WebP directly from loopback Storage without Next optimizer rejection",
    catalogResponse.ok
      && renderedImageUrl?.origin === new URL(status.apiUrl).origin
      && renderedImageResponse?.ok
      && renderedImageResponse.headers.get("content-type")?.includes("image/webp"),
  );
  await renderedImageResponse?.arrayBuffer();

  const { client: admin1, userId: adminId } = await signIn(status.apiUrl, status.publishableKey, credentials.admin);
  const { client: admin2 } = await signIn(status.apiUrl, status.publishableKey, credentials.admin);
  const { client: customer, userId: customerId } = await signIn(status.apiUrl, status.publishableKey, credentials.customer);
  record("synthetic admin identity has admin profile", (await admin1.from("profiles").select("role").eq("id", adminId).single()).data?.role === "admin");
  record("synthetic customer identity remains customer", (await customer.from("profiles").select("role").eq("id", customerId).single()).data?.role === "customer");

  const publicImageId = products.success.imageId;
  const publicImageUrl = serviceClient.storage.from("public-product-media").getPublicUrl(`products/${publicImageId}.webp`).data.publicUrl;
  const imageResponse = await fetch(publicImageUrl);
  record("published synthetic Product image is publicly delivered by local Storage", imageResponse.ok && imageResponse.headers.get("content-type")?.includes("image/webp"));
  await imageResponse.arrayBuffer();

  for (const [route, expectedText] of [
    ["/catalogo", "QA"],
    [`/productos/${products.success.slug}`, products.success.title],
    [`/checkout?product=${products.success.slug}`, products.success.title],
  ]) {
    const response = await fetch(`http://127.0.0.1:3000${route}`);
    const html = await response.text();
    record(`public entry route ${route.split("?")[0]} uses the local public Product projection`, response.status === 200 && html.includes(expectedText));
  }

  const created = await createRequest(serviceClient, keyring, hmacKeyring, products.success, { userId: customerId });
  record("authenticated Checkout request is created from authoritative local Product facts", !created.result.error && created.result.data?.[0]?.status === "created");
  const requestRow = created.result.data[0];
  record("purchase request receives a non-authorizing public reference", /^REVA-[A-F0-9]{12}$/.test(requestRow.public_reference));
  await writeFile(lastFlowPath, `${JSON.stringify({ requestId: created.id, publicReference: requestRow.public_reference })}\n`, { mode: 0o600 });

  const requestDetail = await admin1.rpc("admin_get_purchase_request", { p_request_id: created.id });
  const firstNameEnvelope = requestDetail.data?.contact_ciphertext?.first_name;
  record("authorized admin can inspect request details without plaintext at rest", !requestDetail.error && Boolean(firstNameEnvelope) && !JSON.stringify(requestDetail.data).includes("QA Persona"));
  const firstName = decryptSensitiveValue(firstNameEnvelope, { field: "first_name", recordId: created.id, recordType: "purchase_request" }, keyring);
  record("synthetic contact decrypts with the persisted local key", firstName === "QA Persona");
  const changedFirstCipherCharacter = firstNameEnvelope.ciphertext[0] === "A" ? "B" : "A";
  const tampered = { ...firstNameEnvelope, ciphertext: `${changedFirstCipherCharacter}${firstNameEnvelope.ciphertext.slice(1)}` };
  let rejectedTamper = false;
  try { decryptSensitiveValue(tampered, { field: "first_name", recordId: created.id, recordType: "purchase_request" }, keyring); } catch { rejectedTamper = true; }
  record("authenticated encryption rejects tampered ciphertext", rejectedTamper);

  const listing = await admin1.rpc("admin_list_purchase_requests");
  record("admin can list pending requests without receiving encrypted personal fields", !listing.error && !JSON.stringify(listing.data).includes("QA Persona"));
  const customerAdminList = await customer.rpc("admin_list_purchase_requests");
  record("customer cannot invoke administrator request listing", Boolean(customerAdminList.error));
  const anonymousClient = createClient(status.apiUrl, status.publishableKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const anonAdminList = await anonymousClient.rpc("admin_list_purchase_requests");
  record("anonymous visitor cannot invoke administrator request listing", Boolean(anonAdminList.error));
  const customerGuestDetail = await customer.rpc("admin_get_purchase_request", { p_request_id: created.id });
  record("customer cannot access another request by internal identifier", Boolean(customerGuestDetail.error));

  const idempotentKey = randomUUID();
  const [firstIdempotent, secondIdempotent] = await Promise.all([
    createRequest(serviceClient, keyring, hmacKeyring, products.multiA, { userId: null, keyId: idempotentKey, fingerId: randomUUID() }),
    createRequest(serviceClient, keyring, hmacKeyring, products.multiA, { userId: null, keyId: idempotentKey, fingerId: randomUUID() }),
  ]);
  const idempotentResults = [firstIdempotent.result.data?.[0], secondIdempotent.result.data?.[0]];
  record("concurrent guest requests with the same idempotency key create only one request", idempotentResults.filter((result) => result?.status === "created").length === 1 && idempotentResults.filter((result) => result?.status === "existing").length === 1 && idempotentResults[0]?.public_reference === idempotentResults[1]?.public_reference, JSON.stringify(idempotentResults.map((result) => ({ status: result?.status, publicReference: result?.public_reference }))));

  const rateLimitedFingerprint = randomUUID();
  const rateLimitedAttempts = [];
  for (let attempt = 0; attempt < 6; attempt += 1) {
    rateLimitedAttempts.push(await createRequest(serviceClient, keyring, hmacKeyring, products.multiB, { userId: null, fingerId: rateLimitedFingerprint }));
  }
  record("server-side request rate limit allows five hourly submissions and rejects the sixth", rateLimitedAttempts.slice(0, 5).every(({ result }) => !result.error && result.data?.[0]?.status === "created") && rateLimitedAttempts[5].result.data?.[0]?.status === "rate_limited");
  const rateLimitCleanup = await Promise.all(rateLimitedAttempts.slice(0, 5).map(({ id }) => admin1.rpc("admin_discard_purchase_request", { p_request_id: id })));
  record("rate-limit test removes all five synthetic request records after verification", rateLimitCleanup.every(({ error, data }) => !error && data === true));

  const multi = await createRequest(serviceClient, keyring, hmacKeyring, [products.multiA, products.multiB], { userId: customerId });
  record("multi-item Cart snapshots two verified Products and authoritative subtotal", !multi.result.error && multi.result.data?.[0]?.items?.length === 2 && Number(multi.result.data[0].merchandise_subtotal) === Number(products.multiA.price) + Number(products.multiB.price));

  const stalePrice = await createRequest(serviceClient, keyring, hmacKeyring, products.stalePrice, { userId: customerId, expectedPrice: "0.01" });
  record("client-submitted stale/tampered price is rejected for review, not stored", !stalePrice.result.error && stalePrice.result.data?.[0]?.status === "changed");
  const unavailable = await createRequest(serviceClient, keyring, hmacKeyring, products.unavailable, { userId: customerId });
  record("draft/unavailable Product cannot enter a purchase request", unavailable.result.error?.message === "PRODUCT_UNAVAILABLE");

  const approval = await admin1.rpc("admin_approve_purchase_request", { p_request_id: created.id, p_customer_price_reviewed: true });
  record("administrator approval creates a pending-payment Order", !approval.error && approval.data?.length === 1);
  const orderId = approval.data?.[0]?.order_id;
  const unauthorizedOrderRead = await customer.rpc("admin_get_order", { p_order_id: orderId });
  record("customer cannot read an Order by internal identifier", Boolean(unauthorizedOrderRead.error));
  const unauthorizedPaymentVerification = await customer.rpc("admin_verify_order_payment", { p_order_id: orderId, p_provider_reference: "LOCAL-QA-UNAUTHORIZED" });
  const orderAfterDeniedPayment = await admin1.rpc("admin_get_order", { p_order_id: orderId });
  record("customer cannot change payment status and the denied attempt has no effect", Boolean(unauthorizedPaymentVerification.error) && orderAfterDeniedPayment.data?.payment_status === "not_started" && orderAfterDeniedPayment.data?.status === "pending_payment");
  const order = await admin1.rpc("admin_get_order", { p_order_id: orderId });
  const orderList = await admin1.rpc("admin_list_orders");
  const orderCreatedAt = Array.isArray(orderList.data) ? orderList.data.find((item) => item.id === orderId)?.created_at : undefined;
  const orderSummary = { error: order.error?.message, status: order.data?.status, paymentStatus: order.data?.payment_status, createdAt: orderCreatedAt, reservations: order.data?.reservations };
  record("approved Order remains unpaid and has an active three-hour reservation", !order.error && order.data?.status === "pending_payment" && order.data?.payment_status === "not_started" && order.data?.reservations?.length === 1 && order.data.reservations[0].status === "active" && typeof orderCreatedAt === "string" && Math.abs((new Date(order.data.reservations[0].expires_at) - new Date(orderCreatedAt)) - 3 * 60 * 60 * 1000) < 10000, JSON.stringify(orderSummary));

  const stagedPayment = await admin1.rpc("admin_confirm_order_shipping", { p_order_id: orderId, p_shipping_amount: "0.00", p_coverage_confirmed: true });
  const sentLink = await admin1.rpc("admin_record_payment_link_sent", { p_order_id: orderId, p_payment_link_reference: "LOCAL-E2E-LINK" });
  record("admin confirms coverage and records a manually sent Recurrente link without verifying payment", !stagedPayment.error && Number(stagedPayment.data) === Number(order.data.merchandise_subtotal) && !sentLink.error && sentLink.data === true);
  await setReservationExpired(orderId);
  const orderCleanup = await serviceClient.rpc("cleanup_transactional_records");
  const expiredOrder = await admin1.rpc("admin_get_order", { p_order_id: orderId });
  const releasedProduct = await customer.schema("api").from("published_product_previews").select("slug").eq("slug", products.success.slug).maybeSingle();
  record("expired three-hour reservation releases Product and expires the unpaid Order", !orderCleanup.error && !expiredOrder.error && expiredOrder.data?.status === "expired" && expiredOrder.data?.payment_status === "expired" && expiredOrder.data?.fulfillment_status === "cancelled" && expiredOrder.data?.reservations?.[0]?.status === "expired" && expiredOrder.data?.payments?.[0]?.status === "cancelled" && releasedProduct.data?.slug === products.success.slug, JSON.stringify({ cleanup: orderCleanup.error?.message, order: expiredOrder.data?.status, payment: expiredOrder.data?.payment_status, fulfillment: expiredOrder.data?.fulfillment_status, reservation: expiredOrder.data?.reservations?.[0]?.status, paymentRecord: expiredOrder.data?.payments?.[0]?.status, productPublic: Boolean(releasedProduct.data?.slug), productError: releasedProduct.error?.message }));
  const sourceRequestDeadline = adminDatabaseCommand(`select source_request_expires_at from private.orders where id = '${orderId}';`).trim();
  record("three-hour reservation expiry preserves Order snapshots until the original 24-hour request deadline", expiredOrder.data?.contact != null && expiredOrder.data?.delivery != null && expiredOrder.data?.billing != null && Boolean(sourceRequestDeadline));
  const latePayment = await admin1.rpc("admin_open_late_payment_incident", { p_order_id: orderId });
  const afterLatePayment = await admin1.rpc("admin_get_order", { p_order_id: orderId });
  const productAfterLatePayment = await customer.schema("api").from("published_product_previews").select("slug").eq("slug", products.success.slug).maybeSingle();
  record("late payment opens an audited incident for manual review without reclaiming the expired Product", !latePayment.error && latePayment.data === true && afterLatePayment.data?.incidents?.some((incident) => incident.status === "open") && afterLatePayment.data?.status === "expired" && afterLatePayment.data?.payments?.[0]?.status === "late_unverified" && afterLatePayment.data?.reservations?.[0]?.status === "expired" && productAfterLatePayment.data?.slug === products.success.slug, JSON.stringify({ latePayment: latePayment.error?.message, order: afterLatePayment.data?.status, incidentOpen: afterLatePayment.data?.incidents?.some((incident) => incident.status === "open"), paymentRecord: afterLatePayment.data?.payments?.[0]?.status, reservation: afterLatePayment.data?.reservations?.[0]?.status, productPublic: Boolean(productAfterLatePayment.data?.slug), productError: productAfterLatePayment.error?.message }));
  adminDatabaseCommand(`update private.orders set source_request_expires_at = now() - interval '1 second' where id = '${orderId}';`);
  const lateIncidentCleanup = await serviceClient.rpc("cleanup_transactional_records");
  const retainedIncident = await admin1.rpc("admin_get_order", { p_order_id: orderId });
  record("expired Order is preserved beyond its original deadline while a late-payment incident is unresolved", !lateIncidentCleanup.error && !retainedIncident.error && retainedIncident.data?.payments?.some((payment) => payment.status === "late_unverified") && retainedIncident.data?.contact != null, JSON.stringify({ cleanup: lateIncidentCleanup.error?.message, lookup: retainedIncident.error?.message }));
  const lateNoPaymentResolution = await admin1.rpc("admin_resolve_late_payment", { p_order_id: orderId, p_resolution: "confirmed_no_payment", p_provider_reference: null, p_customer_approved: false });
  record("admin resolves a late-payment incident as no payment only after direct Recurrente review", !lateNoPaymentResolution.error && lateNoPaymentResolution.data === true);
  const lateOrderCleanup = await serviceClient.rpc("cleanup_transactional_records");
  const resolvedLateOrder = await admin1.rpc("admin_get_order", { p_order_id: orderId });
  record("resolved unpaid late Order expires at the original 24-hour deadline and is removed", !lateOrderCleanup.error && Boolean(resolvedLateOrder.error));

  const raceRequestA = await createRequest(serviceClient, keyring, hmacKeyring, products.multiA, { userId: customerId });
  const raceRequestB = await createRequest(serviceClient, keyring, hmacKeyring, products.multiA, { userId: null });
  record("two independent requests can compete for one published unique garment", !raceRequestA.result.error && !raceRequestB.result.error && raceRequestA.result.data?.[0]?.status === "created" && raceRequestB.result.data?.[0]?.status === "created");
  const raceResults = await Promise.all([
    admin1.rpc("admin_approve_purchase_request", { p_request_id: raceRequestA.id, p_customer_price_reviewed: true }),
    admin2.rpc("admin_approve_purchase_request", { p_request_id: raceRequestB.id, p_customer_price_reviewed: true }),
  ]);
  const raceErrors = raceResults.map((result) => result.error?.message ?? "success");
  record("parallel approvals produce exactly one winner and one PRODUCT_UNAVAILABLE loser", raceResults.filter((result) => !result.error).length === 1 && raceResults.filter((result) => result.error?.message === "PRODUCT_UNAVAILABLE").length === 1, JSON.stringify(raceErrors));
  const raceWinner = raceResults.find((result) => !result.error);
  const raceOrderId = raceWinner?.data?.[0]?.order_id;
  const raceOrder = await admin1.rpc("admin_get_order", { p_order_id: raceOrderId });
  record("only one active reservation exists for the competing Product", raceOrder.data?.reservations?.length === 1 && raceOrder.data.reservations[0].status === "active");
  if (typeof raceOrderId === "string") {
    await setReservationExpired(raceOrderId);
    adminDatabaseCommand(`update private.orders set source_request_expires_at = now() - interval '1 second' where id = '${raceOrderId}';`);
  }
  const ordinaryOrderCleanup = await serviceClient.rpc("cleanup_transactional_records");
  const deletedOrdinaryOrder = typeof raceOrderId === "string" ? await admin1.rpc("admin_get_order", { p_order_id: raceOrderId }) : { error: true };
  record("unpaid Order and dependent operational data are deleted at its original deadline when no payment incident exists", !ordinaryOrderCleanup.error && Boolean(deletedOrdinaryOrder.error), JSON.stringify({ cleanup: ordinaryOrderCleanup.error?.message, orderLookup: deletedOrdinaryOrder.error?.message }));

  const loadStartedAt = performance.now();
  const loadRequests = await Promise.all(Array.from({ length: 12 }, () => createRequest(serviceClient, keyring, hmacKeyring, products.multiB, { userId: null })));
  const loadElapsedMs = Math.round(performance.now() - loadStartedAt);
  const loadSuccessful = loadRequests.filter((attempt) => !attempt.result.error && attempt.result.data?.[0]?.status === "created");
  record("bounded 12-way local Checkout burst completes without request errors", loadSuccessful.length === 12, JSON.stringify({ attempted: loadRequests.length, succeeded: loadSuccessful.length, elapsedMs: loadElapsedMs }));
  const loadCleanup = await Promise.all(loadSuccessful.map((attempt) => admin1.rpc("admin_discard_purchase_request", { p_request_id: attempt.id })));
  record("bounded load-test requests and their personal data are removed afterward", loadCleanup.every((result) => !result.error && result.data === true));
  console.log(`Controlled synthetic burst: concurrency=12, requests=${loadRequests.length}, succeeded=${loadSuccessful.length}, elapsed_ms=${loadElapsedMs}.`);

  const expiring = await createRequest(serviceClient, keyring, hmacKeyring, products.multiB, { userId: null });
  record("expiry scenario starts with a local synthetic guest request", !expiring.result.error && expiring.result.data?.[0]?.status === "created");
  await setRequestExpired(expiring.id);
  const [expiredApproval, cleanup] = await Promise.all([
    admin1.rpc("admin_approve_purchase_request", { p_request_id: expiring.id, p_customer_price_reviewed: true }),
    serviceClient.rpc("cleanup_transactional_records"),
  ]);
  record("request expiry cleanup races safely with approval after the 24-hour deadline", expiredApproval.error?.message === "REQUEST_EXPIRED_OR_MISSING" && !cleanup.error);
  const expiredLookup = await admin1.rpc("admin_get_purchase_request", { p_request_id: expiring.id });
  record("expired request cleanup removes temporary personal-data record", !cleanup.error && Boolean(expiredLookup.error));

  const discarded = await createRequest(serviceClient, keyring, hmacKeyring, products.multiB, { userId: null });
  const discard = await admin1.rpc("admin_discard_purchase_request", { p_request_id: discarded.id });
  const discardedLookup = await admin1.rpc("admin_get_purchase_request", { p_request_id: discarded.id });
  record("discarded request and associated details are deleted", !discard.error && discard.data === true && Boolean(discardedLookup.error));

  const adminReviewOrderRequest = await createRequest(serviceClient, keyring, hmacKeyring, products.success, { userId: null });
  const adminReviewOrderApproval = await admin1.rpc("admin_approve_purchase_request", { p_request_id: adminReviewOrderRequest.id, p_customer_price_reviewed: true });
  const adminReviewOrderId = adminReviewOrderApproval.data?.[0]?.order_id;
  record("local admin-review Order is created only from an available synthetic Product", !adminReviewOrderApproval.error && typeof adminReviewOrderId === "string");
  const developerReviewRequest = await createRequest(serviceClient, keyring, hmacKeyring, products.multiB, { userId: null });
  record("one pending synthetic request remains for developer admin walkthrough", !developerReviewRequest.result.error && developerReviewRequest.result.data?.[0]?.status === "created");
  await writeFile(lastFlowPath, `${JSON.stringify({ orderId: adminReviewOrderId, orderPublicReference: adminReviewOrderRequest.result.data[0].public_reference, requestId: developerReviewRequest.id, publicReference: developerReviewRequest.result.data[0].public_reference })}\n`, { mode: 0o600 });

  console.log(`Local transactional checks passed: ${checks.length}.`);
  for (const check of checks) console.log(`PASS ${check}`);
  console.log("No payment verification or WhatsApp message was invoked.");
  await verifyAdminAfterRestart();
  await setReservationExpired(adminReviewOrderId);
  await serviceClient.rpc("cleanup_transactional_records");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
