import assert from "node:assert/strict";
import test from "node:test";

import { createPurchaseRequestMessage } from "../src/features/transactions/purchase-request-message.ts";

test("handoff includes committed reference and verified garment facts without private data or URLs", () => {
  const message = createPurchaseRequestMessage({
    items: [
      { price: "125.00", quantity: 1, sku: "RV-100001", title: "Chumpa negra" },
      { price: "50.50", quantity: 1, sku: "RV-100002", title: "Falda azul" },
    ],
    publicReference: "REVA-AB12CD34EF56",
    subtotal: "175.50",
  });

  assert.match(message ?? "", /Solicitud: REVA-AB12CD34EF56/);
  assert.match(message ?? "", /Chumpa negra\n  SKU: RV-100001\n  Precio: Q 125\.00/);
  assert.match(message ?? "", /Subtotal: Q 175\.50/);
  assert.match(message ?? "", /Envío: pendiente de coordinación/);
  assert.doesNotMatch(message ?? "", /https?:|5555|NIT|dirección|colonia/i);
});

test("handoff rejects malformed references, Products and totals", () => {
  assert.equal(createPurchaseRequestMessage({
    items: [{ price: "10.00", quantity: 1, sku: "RV-100001", title: "Camiseta" }],
    publicReference: "private-uuid",
    subtotal: "10.00",
  }), null);
});
