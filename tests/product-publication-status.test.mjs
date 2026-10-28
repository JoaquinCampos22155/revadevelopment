import assert from "node:assert/strict";
import test from "node:test";

import { getProductPublicationStatusPresentation } from "../src/features/product-manager/product-publication-status.ts";

test("sold inventory is distinguished from both public and unpublished Products", () => {
  assert.deepEqual(getProductPublicationStatusPresentation("sold", false), {
    domainLabel: null,
    label: "Vendido",
    tone: "sold",
  });
  assert.deepEqual(getProductPublicationStatusPresentation("published", true), {
    domainLabel: null,
    label: "Publicado",
    tone: "public",
  });
  assert.equal(getProductPublicationStatusPresentation("draft", false).label, "No publicado");
});
