import assert from "node:assert/strict";
import test from "node:test";

import { createProductStructuredData } from "../src/features/catalog/product-structured-data.ts";

const product = {
  title: "Chumpa acolchada negra",
  description: "Prenda revisada en buen estado.",
  brand: "REVA",
  garmentType: "Chumpas",
  price: { amount: "250.00", currency: "GTQ" },
  images: [{ url: "https://images.example.test/product.webp" }],
};

test("published Product structured data includes a current factual Offer", () => {
  const data = createProductStructuredData(product, "https://revagt.com/productos/chumpa-negra");

  assert.equal(data["@type"], "Product");
  assert.deepEqual(data.image, ["https://images.example.test/product.webp"]);
  assert.deepEqual(data.offers, {
    "@type": "Offer",
    url: "https://revagt.com/productos/chumpa-negra",
    price: "250.00",
    priceCurrency: "GTQ",
    availability: "https://schema.org/InStock",
  });
  assert.equal("review" in data, false);
  assert.equal("aggregateRating" in data, false);
});

test("structured data does not add unavailable optional claims", () => {
  const data = createProductStructuredData({ ...product, brand: null }, "https://revagt.com/productos/chumpa-negra");

  assert.equal("brand" in data, false);
  assert.equal("priceValidUntil" in data.offers, false);
  assert.equal("shippingDetails" in data.offers, false);
});
