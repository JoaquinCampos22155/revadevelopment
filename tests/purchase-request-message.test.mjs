import assert from "node:assert/strict";
import test from "node:test";

import { createPurchaseRequestMessage } from "../src/features/transactions/purchase-request-message.ts";

test("handoff includes the public reference and verified public garment facts without internal identifiers", () => {
  const message = createPurchaseRequestMessage({
    items: [
      { price: "125.00", quantity: 1, title: "Chumpa negra" },
      { price: "50.50", quantity: 1, title: "Falda azul" },
    ],
    publicReference: "REVA-AB12CD34EF56",
    subtotal: "175.50",
  });

  assert.match(message ?? "", /¡Hola, REVA! Acabo de completar una solicitud de compra en su página web\./);
  assert.match(message ?? "", /Mi referencia es REVA-AB12CD34EF56\./);
  assert.match(message ?? "", /• Chumpa negra — Q 125\.00/);
  assert.doesNotMatch(message ?? "", /SKU|RV-100001|RV-100002/);
  assert.match(message ?? "", /Subtotal: Q 175\.50/);
  assert.match(message ?? "", /confirmar su disponibilidad y coordinar el pago/);
  assert.doesNotMatch(message ?? "", /https?:|5555|NIT|dirección|colonia/i);
});

test("handoff rejects malformed references, Products and totals", () => {
  assert.equal(createPurchaseRequestMessage({
    items: [{ price: "10.00", quantity: 1, title: "Camiseta" }],
    publicReference: "private-uuid",
    subtotal: "10.00",
  }), null);
});

test("handoff accepts full UUID-strength public references", () => {
  const message = createPurchaseRequestMessage({
    items: [{ price: "10.00", quantity: 1, title: "Camiseta" }],
    publicReference: "REVA-0123456789ABCDEF0123456789ABCDEF",
    subtotal: "10.00",
  });

  assert.match(message ?? "", /Mi referencia es REVA-0123456789ABCDEF0123456789ABCDEF/);
});
