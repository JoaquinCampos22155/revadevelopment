import assert from "node:assert/strict";
import test from "node:test";

import { catalogProductImageSizes } from "../src/features/catalog/catalog-product-image-sizing.ts";

test("catalog product images describe their actual responsive grid slot widths", () => {
  assert.equal(
    catalogProductImageSizes,
    "(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc((100vw - 4.25rem) / 2), (max-width: 1279px) calc((100vw - 21.25rem) / 2), 19.2rem",
  );
});
