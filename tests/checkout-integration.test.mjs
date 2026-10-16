import assert from "node:assert/strict";
import test from "node:test";

import { createCheckoutContactMessage } from "../src/features/checkout/checkout-contact-message.ts";
import { CHECKOUT_PURCHASE_REQUEST_TEMPLATE } from "../src/features/checkout/checkout-contact-message.ts";
import { createCheckoutHref, hasCheckoutPriceChanged, parseCheckoutSelection } from "../src/features/checkout/checkout-selection.ts";
import { getCheckoutProgress } from "../src/features/checkout/checkout-progress.ts";
import { formatCheckoutContactName, validateCheckoutDelivery } from "../src/features/checkout/checkout-validation.ts";
import { INITIAL_BILLING_DEMO, selectBillingDemoType, updateBillingDemoNit, updateBillingDemoRecipientName } from "../src/features/checkout-prototype/billing-demo.ts";
import { MAX_CART_ITEMS } from "../src/features/cart/cart-storage.ts";

test("direct Product entry selects exactly one public slug", () => {
  assert.deepEqual(parseCheckoutSelection({ product: "blusa-lino" }), {
    entry: "product",
    slugs: ["blusa-lino"],
  });
  assert.equal(createCheckoutHref(["blusa-lino"]), "/checkout?products=blusa-lino");
});

test("Cart entry accepts multiple slugs, removes duplicates, and respects the cap", () => {
  assert.deepEqual(parseCheckoutSelection({ products: ["blusa-lino", "jeans-rectos", "blusa-lino"] }), {
    entry: "cart",
    slugs: ["blusa-lino", "jeans-rectos"],
  });
  assert.equal(createCheckoutHref(["blusa-lino", "jeans-rectos"]), "/checkout?products=blusa-lino&products=jeans-rectos");
  assert.equal(parseCheckoutSelection({ products: Array.from({ length: MAX_CART_ITEMS + 1 }, (_, index) => `prenda-${index}`) }).entry, "invalid");
});

test("empty, malformed, ambiguous, and duplicate checkout links fail safely", () => {
  assert.equal(parseCheckoutSelection({}).entry, "empty");
  assert.equal(parseCheckoutSelection({ product: "bad slug" }).entry, "invalid");
  assert.equal(parseCheckoutSelection({ product: "blusa-lino", products: "jeans-rectos" }).entry, "invalid");
  assert.equal(createCheckoutHref(["blusa-lino", "blusa-lino"]), null);
});

test("final inquiry requires the same ordered public slugs and current prices as the reviewed snapshot", () => {
  const reviewed = [{ slug: "blusa-lino", price: "120.00" }, { slug: "jeans-rectos", price: "80.50" }];
  assert.equal(hasCheckoutPriceChanged(reviewed, reviewed), false);
  assert.equal(hasCheckoutPriceChanged([{ ...reviewed[0], price: "125.00" }, reviewed[1]], reviewed), true);
  assert.equal(hasCheckoutPriceChanged([...reviewed].reverse(), reviewed), true);
  assert.equal(hasCheckoutPriceChanged(reviewed.slice(0, 1), reviewed), true);
});

test("WhatsApp inquiry contains public current Product facts only", () => {
  const message = createCheckoutContactMessage([
    { canonicalUrl: "https://reva.example/productos/blusa-lino", price: "120.00", title: "Blusa de lino" },
    { canonicalUrl: "https://reva.example/productos/jeans-rectos", price: "80.50", title: "Jeans rectos" },
  ]);

  assert.ok(message);
  assert.match(message, /Blusa de lino — Q 120\.00/);
  assert.match(message, /Subtotal de prendas: Q 200\.50/);
  assert.match(message, /Envío: pendiente de confirmación\./);
  assert.match(message, /https:\/\/reva\.example\/productos\/blusa-lino/);
  assert.doesNotMatch(message, /NIT|dirección|teléfono|correo|casa|apartamento/i);
  assert.doesNotMatch(message, /uuid|intake|sku|storage|internal-id/i);
});

test("WhatsApp inquiry rejects missing Products, unsafe URLs, and invalid prices", () => {
  assert.equal(createCheckoutContactMessage([]), null);
  assert.equal(createCheckoutContactMessage([{ canonicalUrl: "javascript:alert(1)", price: "1.00", title: "Prenda" }]), null);
  assert.equal(createCheckoutContactMessage([{ canonicalUrl: "https://reva.example/productos/prenda", price: "1.0", title: "Prenda" }]), null);
});

test("billing review switches CF/NIT without retaining NIT fields in CF mode", () => {
  const withNit = updateBillingDemoNit(updateBillingDemoRecipientName(selectBillingDemoType(INITIAL_BILLING_DEMO, "nit"), "Ana Ejemplo"), "1234567-8");
  assert.deepEqual(withNit, { type: "nit", recipientName: "Ana Ejemplo", nit: "1234567-8" });
  assert.deepEqual(selectBillingDemoType(withNit, "cf"), { type: "cf", recipientName: "", nit: "" });
  assert.deepEqual(selectBillingDemoType(INITIAL_BILLING_DEMO, "nit"), { ...INITIAL_BILLING_DEMO, type: "nit" });
});

test("checkout progress presents four truthful stages and keeps payment in the future", () => {
  assert.deepEqual(getCheckoutProgress(false), [
    { label: "Entrega", status: "current" },
    { label: "Factura", status: "future" },
    { label: "Revisión", status: "future" },
    { label: "Pago", status: "future" },
  ]);
  assert.deepEqual(getCheckoutProgress(true), [
    { label: "Entrega", status: "complete" },
    { label: "Factura", status: "complete" },
    { label: "Revisión", status: "current" },
    { label: "Pago", status: "future" },
  ]);
});

test("future purchase-request WhatsApp template remains placeholders, not a fabricated request", () => {
  assert.match(CHECKOUT_PURCHASE_REQUEST_TEMPLATE, /Solicitud: \[referencia real asignada por REVA\]/);
  assert.match(CHECKOUT_PURCHASE_REQUEST_TEMPLATE, /SKU: \[SKU verificado\]/);
  assert.match(CHECKOUT_PURCHASE_REQUEST_TEMPLATE, /Envío: \[dirección autorizada por el cliente\]/);
  assert.doesNotMatch(CHECKOUT_PURCHASE_REQUEST_TEMPLATE, /https?:\/\/|\bNIT\b|\+?\d{7,}/i);
});


test("checkout delivery validation requires first and last name, Guatemala phone, municipality, street, and house number", () => {
  assert.deepEqual(validateCheckoutDelivery({
    firstName: "   ",
    lastName: "\t",
    phone: "123",
    municipalityCode: "",
    street: "  ",
    houseNumber: "",
  }), {
    firstName: "Ingresa tu nombre.",
    lastName: "Ingresa tu apellido.",
    phone: "Ingresa un teléfono válido de Guatemala (8 dígitos, con o sin +502).",
    municipalityCode: "Selecciona un municipio.",
    street: "Ingresa la calle o avenida.",
    houseNumber: "Ingresa el número de casa o lote.",
  });
});

test("checkout delivery validation trims values and accepts Guatemala phone formats", () => {
  assert.deepEqual(validateCheckoutDelivery({
    firstName: " Ana María ",
    lastName: " De León Pérez ",
    phone: "+502 5555-1234",
    municipalityCode: "0101",
    street: "  5a avenida ",
    houseNumber: " 12 ",
  }), {});
  assert.deepEqual(validateCheckoutDelivery({
    firstName: "Ana",
    lastName: "Pérez",
    phone: "55551234",
    municipalityCode: "0101",
    street: "5a avenida",
    houseNumber: "12",
  }), {});
});

test("checkout review displays a trimmed full contact name while fields stay separate", () => {
  assert.equal(formatCheckoutContactName("  Ana María ", " De León Pérez  "), "Ana María De León Pérez");
});

test("checkout delivery phone validation rejects letters even when eight digits are present", () => {
  const result = validateCheckoutDelivery({
    firstName: "Ana",
    lastName: "Pérez",
    phone: "llámame55551234",
    municipalityCode: "0101",
    street: "5a avenida",
    houseNumber: "12",
  });

  assert.equal(result.phone, "Ingresa un teléfono válido de Guatemala (8 dígitos, con o sin +502).");
});

test("each required delivery field is validated independently", () => {
  const complete = {
    firstName: "Ana",
    lastName: "Pérez",
    phone: "55551234",
    municipalityCode: "0101",
    street: "5a avenida",
    houseNumber: "12",
  };

  for (const field of ["firstName", "lastName", "phone", "municipalityCode", "street", "houseNumber"]) {
    assert.ok(validateCheckoutDelivery({ ...complete, [field]: "   " })[field], `${field} should be required`);
  }
});
