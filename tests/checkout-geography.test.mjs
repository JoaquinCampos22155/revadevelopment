import test from "node:test";
import assert from "node:assert/strict";

import { findGuatemalaMunicipality, getVerifiedZoneCatalog, GUATEMALA_MUNICIPALITIES } from "../src/features/checkout-prototype/municipalities.ts";
import { INITIAL_BILLING_DEMO, selectBillingDemoType, updateBillingDemoNit, updateBillingDemoRecipientName } from "../src/features/checkout-prototype/billing-demo.ts";
import { createMunicipalityMapRenderModel } from "../src/features/checkout-prototype/municipality-map.ts";
import { NON_GEOGRAPHIC_MUNICIPALITY_FIXTURES } from "./fixtures/municipality-map.fixtures.mjs";

test("the prototype selector uses the 17 current INE 2025 Guatemala municipality codes", () => {
  assert.equal(GUATEMALA_MUNICIPALITIES.length, 17);
  assert.deepEqual(GUATEMALA_MUNICIPALITIES.map(({ code }) => code), Array.from({ length: 17 }, (_, index) => `01${String(index + 1).padStart(2, "0")}`));
  assert.equal(new Set(GUATEMALA_MUNICIPALITIES.map(({ name }) => name)).size, 17);
});

test("municipality labels resolve by stable code and invalid values are not misrepresented as Guatemala", () => {
  assert.equal(findGuatemalaMunicipality("0108").name, "Mixco");
  assert.equal(findGuatemalaMunicipality("not-a-code"), undefined);
});

test("only municipalities with verified text catalogs receive zone dropdown data", () => {
  assert.deepEqual(getVerifiedZoneCatalog("0101").zones, [...Array.from({ length: 19 }, (_, index) => index + 1), 21, 24, 25]);
  assert.deepEqual(getVerifiedZoneCatalog("0108").zones, Array.from({ length: 11 }, (_, index) => index + 1));
  assert.deepEqual(getVerifiedZoneCatalog("0117").zones, [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13]);
  assert.equal(getVerifiedZoneCatalog("0115"), undefined);
  assert.equal(getVerifiedZoneCatalog("0102"), undefined);
});

test("billing demo defaults to CF without requiring or retaining a NIT", () => {
  const withDemoNit = updateBillingDemoNit(INITIAL_BILLING_DEMO, "NIT-DEMO-123");
  const switchedToCf = selectBillingDemoType(withDemoNit, "cf");

  assert.deepEqual(INITIAL_BILLING_DEMO, { type: "cf", nit: "", recipientName: "" });
  assert.deepEqual(switchedToCf, { type: "cf", nit: "", recipientName: "" });
});

test("billing demo reveals NIT mode and preserves the illustrative NIT and recipient name", () => {
  const withDemoName = updateBillingDemoRecipientName(INITIAL_BILLING_DEMO, "Nombre ficticio");
  const withDemoNit = updateBillingDemoNit(withDemoName, "NIT-DEMO-123");
  const switchedToNit = selectBillingDemoType(withDemoNit, "nit");

  assert.deepEqual(switchedToNit, { type: "nit", nit: "NIT-DEMO-123", recipientName: "Nombre ficticio" });
  assert.deepEqual(selectBillingDemoType(switchedToNit, "cf"), { type: "cf", nit: "", recipientName: "" });
});

test("map render model accepts all 17 isolated non-geographic fixtures without adding shapes to the public view", () => {
  const departmentView = createMunicipalityMapRenderModel(NON_GEOGRAPHIC_MUNICIPALITY_FIXTURES, "", GUATEMALA_MUNICIPALITIES);
  assert.equal(departmentView.features.length, 17);
  assert.equal(departmentView.resetAvailable, false);
  assert.equal(departmentView.transform, "matrix(1 0 0 1 0 0)");
  assert.equal(departmentView.features.some(({ selected }) => selected), false);
});

test("map selection resolves municipality labels and produces a bounded zoom transform", () => {
  const municipalityView = createMunicipalityMapRenderModel(NON_GEOGRAPHIC_MUNICIPALITY_FIXTURES, "0108", GUATEMALA_MUNICIPALITIES);
  const selected = municipalityView.features.filter(({ selected }) => selected);

  assert.equal(selected.length, 1);
  assert.equal(selected[0].label, "Mixco");
  assert.match(municipalityView.transform, /^matrix\(5 0 0 5 /);
  assert.equal(municipalityView.selectedLabel, "Municipio seleccionado: Mixco");
  assert.equal(municipalityView.resetAvailable, true);
});

test("map render model rejects unknown municipality identifiers instead of labeling them as real places", () => {
  const invalidGeometry = NON_GEOGRAPHIC_MUNICIPALITY_FIXTURES.map((feature, index) => index === 0 ? { ...feature, code: "9999" } : feature);
  const model = createMunicipalityMapRenderModel(invalidGeometry, "9999", GUATEMALA_MUNICIPALITIES);

  assert.equal(model.features.length, 0);
  assert.equal(model.selectedLabel, "El mapa aún no está disponible");
  assert.equal(model.resetAvailable, false);
});

test("map renderer refuses a partial municipality boundary set", () => {
  const partialModel = createMunicipalityMapRenderModel(NON_GEOGRAPHIC_MUNICIPALITY_FIXTURES.slice(0, 16), "0101", GUATEMALA_MUNICIPALITIES);

  assert.equal(partialModel.features.length, 0);
  assert.equal(partialModel.resetAvailable, false);
});
