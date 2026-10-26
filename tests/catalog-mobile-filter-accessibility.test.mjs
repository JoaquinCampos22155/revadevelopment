import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const filtersSource = await readFile(
  new URL("../src/features/catalog/components/CatalogFilters.tsx", import.meta.url),
  "utf8",
);

test("mobile catalog filter trigger controls the rendered dialog", () => {
  const triggerId = filtersSource.match(/aria-controls="([^"]+)"/)?.[1];
  assert.ok(triggerId, "mobile filter trigger must identify its controlled dialog");
  assert.match(filtersSource, new RegExp(`<dialog[^>]*\\bid="${triggerId}"`));
});
