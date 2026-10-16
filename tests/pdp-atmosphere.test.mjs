import assert from "node:assert/strict";
import test from "node:test";

import { getProductAtmosphere } from "../src/features/catalog/product-atmosphere.ts";

test("maps controlled garment colors to restrained editorial atmospheres", () => {
  assert.equal(getProductAtmosphere("azul"), "#66818a");
  assert.equal(getProductAtmosphere("rojo"), "#78434b");
  assert.equal(getProductAtmosphere("verde"), "#71846f");
  assert.equal(getProductAtmosphere("beige"), "#c8a36d");
  assert.equal(getProductAtmosphere("morado"), "#897b91");
  assert.equal(getProductAtmosphere("negro"), "#766e64");
  assert.equal(getProductAtmosphere("verde_claro"), "#87977c");
});

test("uses a neutral REVA fallback for absent, unknown, and mixed colors", () => {
  assert.equal(getProductAtmosphere(null), "#64747a");
  assert.equal(getProductAtmosphere("color-no-controlado"), "#64747a");
  assert.equal(getProductAtmosphere("multicolor"), "#77868a");
  assert.equal(getProductAtmosphere("constructor"), "#64747a");
});
