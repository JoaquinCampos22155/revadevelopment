import assert from "node:assert/strict";
import test from "node:test";

import {
  getNextProductManagerSort,
  buildProductManagerSearchPattern,
  normalizeProductManagerSearch,
  parseProductManagerSort,
} from "../src/features/product-manager/product-manager-listing.ts";

test("Product Manager sort links cycle each column through its approved order and back to default", () => {
  assert.equal(getNextProductManagerSort(null, "product"), "product-asc");
  assert.equal(getNextProductManagerSort("product-asc", "product"), "product-desc");
  assert.equal(getNextProductManagerSort("product-desc", "product"), null);
  assert.equal(getNextProductManagerSort("status-priority", "status"), "status-reverse");
  assert.equal(getNextProductManagerSort("status-reverse", "status"), null);
  assert.equal(getNextProductManagerSort("published-newest", "published"), "published-oldest");
  assert.equal(getNextProductManagerSort("published-oldest", "published"), null);
  assert.equal(getNextProductManagerSort("product-asc", "status"), "status-priority");
});

test("Product Manager accepts only supported persisted sort states", () => {
  assert.equal(parseProductManagerSort("status-priority"), "status-priority");
  assert.equal(parseProductManagerSort("not-a-sort"), null);
});

test("Product Manager search preserves accents but removes PostgREST filter syntax", () => {
  assert.equal(normalizeProductManagerSearch("  Vestído  "), "Vestído");
  assert.equal(normalizeProductManagerSearch("RV-001,%_.*()"), "RV-001");
  assert.equal(normalizeProductManagerSearch("  "), "");
});

test("Product Manager search matches ordered words across title punctuation", () => {
  const normalized = normalizeProductManagerSearch("Prenda sintética QA · compra");
  assert.equal(normalized, "Prenda sintética QA compra");
  assert.equal(buildProductManagerSearchPattern(normalized), "%Prenda%sintética%QA%compra%");
});
