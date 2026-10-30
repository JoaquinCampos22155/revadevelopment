import assert from "node:assert/strict";
import test from "node:test";

import {
  CHECKOUT_ACTION_DATA_MAX_BYTES,
  CHECKOUT_SERVER_ACTION_BODY_MAX_BYTES,
  isCheckoutActionPayloadWithinLimit,
  shouldRejectOversizedCheckoutAction,
} from "../src/features/checkout/checkout-request-limits.ts";
import {
  checkoutRequestScopeKey,
  clearCheckoutHandoff,
  readCheckoutHandoff,
  writeCheckoutHandoff,
} from "../src/features/checkout/checkout-request-handoff.ts";
import { isLocalTransactionalRequestsEnabled } from "../src/features/transactions/local-transactional-gate.ts";

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, value); }
  removeItem(key) { this.values.delete(key); }
}

const futureExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

test("transactional request gate stays closed in production regardless of flag and Supabase URL", () => {
  const localEnv = { NODE_ENV: "development", REVA_LOCAL_TRANSACTIONAL_ENABLED: "true", NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:56400" };
  assert.equal(isLocalTransactionalRequestsEnabled({ ...localEnv, NODE_ENV: "production" }), false);
  assert.equal(isLocalTransactionalRequestsEnabled(localEnv), true);
  assert.equal(isLocalTransactionalRequestsEnabled({ ...localEnv, NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" }), false);
  assert.equal(isLocalTransactionalRequestsEnabled({ ...localEnv, NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1.attacker.example" }), false);
});

test("Checkout Server Action body guard applies only to identified POST actions on Checkout", () => {
  const request = { method: "POST", pathname: "/checkout", hasActionId: true, contentLength: String(CHECKOUT_SERVER_ACTION_BODY_MAX_BYTES + 1) };
  assert.equal(shouldRejectOversizedCheckoutAction(request), true);
  assert.equal(shouldRejectOversizedCheckoutAction({ ...request, pathname: "/carrito" }), false);
  assert.equal(shouldRejectOversizedCheckoutAction({ ...request, method: "GET" }), false);
  assert.equal(shouldRejectOversizedCheckoutAction({ ...request, hasActionId: false }), false);
  assert.equal(shouldRejectOversizedCheckoutAction({ ...request, contentLength: null }), false);
});

test("Checkout payload validation uses UTF-8 byte length and rejects oversized or unserializable input", () => {
  const valid = { slugs: ["chumpa-negra"], expected: [{ slug: "chumpa-negra", price: "10.00" }], details: { contact: { firstName: "José" } }, idempotencyKey: "a7caac20-4b22-4a2e-96be-4e3039ea2322" };
  assert.equal(isCheckoutActionPayloadWithinLimit(valid), true);
  assert.ok(CHECKOUT_ACTION_DATA_MAX_BYTES < CHECKOUT_SERVER_ACTION_BODY_MAX_BYTES);
  assert.equal(isCheckoutActionPayloadWithinLimit({ ...valid, details: { text: "x".repeat(CHECKOUT_ACTION_DATA_MAX_BYTES) } }), false);
  const circular = {};
  circular.self = circular;
  assert.equal(isCheckoutActionPayloadWithinLimit({ ...valid, details: circular }), false);
});

test("handoff storage is scoped to exact public Product slugs and prices", () => {
  assert.notEqual(checkoutRequestScopeKey([{ slug: "chumpa-negra", price: "10.00" }]), checkoutRequestScopeKey([{ slug: "chumpa-negra", price: "11.00" }]));
  assert.notEqual(checkoutRequestScopeKey([{ slug: "chumpa-negra", price: "10.00" }]), checkoutRequestScopeKey([{ slug: "falda-azul", price: "10.00" }]));
});

test("handoff persists only the temporary key and public retry details, then expires", () => {
  const storage = new MemoryStorage();
  const selectionKey = checkoutRequestScopeKey([{ slug: "chumpa-negra", price: "10.00" }]);
  const key = "reva.checkout.handoff.v1." + encodeURIComponent(selectionKey);
  const record = {
    idempotencyKey: "a7caac20-4b22-4a2e-96be-4e3039ea2322",
    selectionKey,
    expiresAt: futureExpiry,
    publicReference: "REVA-A1B2C3D4E5F6",
    whatsappUrl: "https://wa.me/15555550100?text=Solicitud%3A%20REVA-A1B2C3D4E5F6",
  };
  assert.equal(writeCheckoutHandoff(storage, key, record), true);
  assert.deepEqual(readCheckoutHandoff(storage, key, selectionKey, Date.parse(futureExpiry) - 1), record);
  const serialized = storage.getItem(key) ?? "";
  assert.doesNotMatch(serialized, /firstName|lastName|phone|address|email|NIT/i);
  assert.equal(readCheckoutHandoff(storage, key, selectionKey, Date.parse(futureExpiry)), null);
  assert.equal(storage.getItem(key), null);
});

test("handoff rejects selection mismatch, malformed references and unsafe URLs", () => {
  const storage = new MemoryStorage();
  const a = checkoutRequestScopeKey([{ slug: "chumpa-negra", price: "10.00" }]);
  const b = checkoutRequestScopeKey([{ slug: "falda-azul", price: "10.00" }]);
  const key = "reva.checkout.handoff.v1." + encodeURIComponent(a);
  assert.equal(writeCheckoutHandoff(storage, key, {
    idempotencyKey: "a7caac20-4b22-4a2e-96be-4e3039ea2322",
    selectionKey: a,
    expiresAt: futureExpiry,
    publicReference: "not-a-reference",
    whatsappUrl: "https://evil.example/",
  }), false);
  assert.equal(writeCheckoutHandoff(storage, key, {
    idempotencyKey: "a7caac20-4b22-4a2e-96be-4e3039ea2322",
    selectionKey: a,
    expiresAt: futureExpiry,
    publicReference: "REVA-A1B2C3D4E5F6",
    whatsappUrl: "https://wa.me/15555550100?text=hello",
  }), true);
  assert.equal(readCheckoutHandoff(storage, key, b, Date.parse("2026-10-29T12:00:00.000Z")), null);
  clearCheckoutHandoff(storage, key);
  assert.equal(storage.getItem(key), null);
});

test("handoff accepts UUID-strength public references while retaining legacy references", () => {
  const storage = new MemoryStorage();
  const selectionKey = checkoutRequestScopeKey([{ slug: "chumpa-negra", price: "10.00" }]);
  const storageKey = "reva.checkout.handoff.v1." + encodeURIComponent(selectionKey);
  const record = {
    idempotencyKey: "a7caac20-4b22-4a2e-96be-4e3039ea2322",
    selectionKey,
    expiresAt: futureExpiry,
    publicReference: "REVA-0123456789ABCDEF0123456789ABCDEF",
    whatsappUrl: "https://wa.me/15555550100?text=Solicitud%3A%20REVA-0123456789ABCDEF0123456789ABCDEF",
  };
  assert.equal(writeCheckoutHandoff(storage, storageKey, record), true);
  assert.deepEqual(readCheckoutHandoff(storage, storageKey, selectionKey, Date.parse(futureExpiry) - 1), record);
});
