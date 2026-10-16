import assert from "node:assert/strict";
import test from "node:test";

import { addCartItem, MAX_CART_ITEMS, parseCartStorage, removeCartItem, serializeCartStorage } from "../src/features/cart/cart-storage.ts";
import { cartSubtotal } from "../src/features/cart/cart-total.ts";
import { resolveCartProductPreviews } from "../src/features/cart/cart-projection.ts";
import { createCartWhatsAppMessage } from "../src/features/cart/cart-whatsapp-message.ts";
import { conditionLabels } from "../src/features/catalog/condition.ts";

test("adds a unique public slug only once and supports removing and clearing", () => {
  const first = addCartItem([], "blusa-lino");
  const duplicate = addCartItem(first, "blusa-lino");
  assert.deepEqual(duplicate, ["blusa-lino"]);
  assert.deepEqual(removeCartItem(duplicate, "blusa-lino"), []);
  assert.deepEqual(parseCartStorage(serializeCartStorage([])), []);
});

test("persists a versioned list and recovers safely from corrupt or obsolete storage", () => {
  assert.deepEqual(parseCartStorage(serializeCartStorage(["camisa-azul", "jeans-rectos"])), ["camisa-azul", "jeans-rectos"]);
  assert.deepEqual(parseCartStorage("not-json"), []);
  assert.deepEqual(parseCartStorage(JSON.stringify({ version: 0, items: ["camisa-azul"] })), []);
  assert.deepEqual(parseCartStorage(JSON.stringify({ version: 1, items: ["ok", "has spaces", "ok"] })), ["ok"]);
});

test("deduplicates and caps corrupted Cart data at the realistic maximum", () => {
  const refs = Array.from({ length: MAX_CART_ITEMS + 10 }, (_, index) => `prenda-${index}`);
  const parsed = parseCartStorage(JSON.stringify({ version: 1, items: refs }));
  assert.equal(parsed.length, MAX_CART_ITEMS);
  assert.equal(addCartItem(parsed, "una-mas").length, MAX_CART_ITEMS);
});

test("sums only supplied current prices using integer cents", () => {
  assert.equal(cartSubtotal(["Q 10.10", "Q 0.25", "Q 9.65"]), "Q 20.00");
  assert.equal(cartSubtotal([]), "Q 0.00");
});

const publicPreview = (overrides = {}) => ({
  audience: "unisex",
  brand: "REVA test fixture",
  color: "Verde",
  conditionRating: 2,
  garmentType: "camisas",
  image: { altText: "Prenda de prueba", height: 500, position: 0, url: "https://images.example/prenda.webp", width: 400 },
  price: { amount: "120.00", currency: "GTQ" },
  sizeLabel: "M",
  slug: "blusa-verde",
  title: "Blusa verde",
  ...overrides,
});

test("unavailable public Product is transparent, excluded from totals/messages, and removable", () => {
  const resolved = resolveCartProductPreviews(["blusa-verde"], [], conditionLabels);
  assert.deepEqual(resolved, [{ slug: "blusa-verde", product: null }]);
  assert.equal(cartSubtotal(resolved.flatMap(({ product }) => product ? [product.price] : [])), "Q 0.00");
  assert.equal(createCartWhatsAppMessage(resolved.flatMap(({ product }) => product ? [{ canonicalUrl: `https://reva.example${product.href}`, price: product.price.slice(2), title: product.title }] : [])), null);
  assert.deepEqual(removeCartItem(["blusa-verde"], "blusa-verde"), []);
});

test("stale public slug resolves without fabricated facts and can be removed safely", () => {
  const resolved = resolveCartProductPreviews(["prenda-retirada"], [publicPreview()], conditionLabels);
  assert.equal(resolved[0].product, null);
  assert.equal(resolved[0].slug, "prenda-retirada");
  assert.equal(cartSubtotal(resolved.flatMap(({ product }) => product ? [product.price] : [])), "Q 0.00");
  assert.deepEqual(removeCartItem(["prenda-retirada"], "prenda-retirada"), []);
});

test("changed public price wins over the slug-only persisted selection", () => {
  const stored = serializeCartStorage(["blusa-verde"]);
  assert.equal(stored.includes("120.00"), false);
  const current = publicPreview({ price: { amount: "145.75", currency: "GTQ" } });
  const [resolved] = resolveCartProductPreviews(parseCartStorage(stored), [current], conditionLabels);
  assert.equal(resolved.product.price, "Q 145.75");
  assert.equal(cartSubtotal([resolved.product.price]), "Q 145.75");
  const message = createCartWhatsAppMessage([{
    canonicalUrl: `https://reva.example${resolved.product.href}`,
    price: current.price.amount,
    title: resolved.product.title,
  }]);
  assert.match(message, /Blusa verde — Q 145\.75/);
  assert.doesNotMatch(message, /Q 120\.00/);
});

test("multi-Product message contains public facts only and no operational identifiers", () => {
  const message = createCartWhatsAppMessage([
    { canonicalUrl: "https://reva.example/productos/blusa-verde", price: "120.00", title: "Blusa verde" },
    { canonicalUrl: "https://reva.example/productos/jeans-azules", price: "80.50", title: "Jeans azules" },
  ]);
  assert.ok(message);
  assert.match(message, /Blusa verde — Q 120\.00/);
  assert.match(message, /Subtotal de prendas: Q 200\.50/);
  assert.match(message, /https:\/\/reva\.example\/productos\/blusa-verde/);
  assert.doesNotMatch(message, /uuid|intake|sku|storage|internal-id/i);
  assert.equal(createCartWhatsAppMessage([]), null);
});
