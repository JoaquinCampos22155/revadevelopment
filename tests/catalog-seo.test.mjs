import assert from "node:assert/strict";
import test from "node:test";

const catalogSeoModule = await import("../src/features/catalog/catalog-seo.ts").catch(() => ({}));

function catalogSeo() {
  assert.equal(typeof catalogSeoModule.createPublicSitemapEntries, "function", "public sitemap builder is implemented");
  assert.equal(typeof catalogSeoModule.createPublicRobotsRules, "function", "public robots rules are implemented");
  assert.equal(typeof catalogSeoModule.getCatalogMetadataPolicy, "function", "catalog pagination metadata policy is implemented");
  assert.equal(typeof catalogSeoModule.collectPublishedProductSlugs, "function", "published Product slugs are read in bounded batches");
  assert.equal(typeof catalogSeoModule.createPublicSitemap, "function", "sitemap remains available when the public catalog read fails");
  return catalogSeoModule;
}

test("sitemap contains only canonical public routes and eligible published product slugs", () => {
  const { createPublicSitemapEntries } = catalogSeo();
  const entries = createPublicSitemapEntries(["chumpa-negra", "sueter-azul"]);
  const locations = entries.map((entry) => entry.url);

  assert.ok(locations.includes("https://revagt.com/"));
  assert.ok(locations.includes("https://revagt.com/catalogo"));
  assert.ok(locations.includes("https://revagt.com/productos/chumpa-negra"));
  assert.ok(locations.includes("https://revagt.com/productos/sueter-azul"));
  assert.ok(locations.every((location) => location.startsWith("https://revagt.com/")));
  assert.ok(locations.every((location) => !/\/(?:admin|checkout|carrito|auth|playground)(?:\/|$)/.test(new URL(location).pathname)));
});

test("robots publishes the canonical sitemap and disallows non-public experience routes", () => {
  const { createPublicRobotsRules } = catalogSeo();
  const rules = createPublicRobotsRules();
  const crawler = rules.rules[0];

  assert.equal(crawler.userAgent, "*");
  assert.ok(crawler.allow?.includes("/"));
  assert.ok(crawler.disallow?.includes("/admin"));
  assert.ok(crawler.disallow?.includes("/checkout"));
  assert.ok(crawler.disallow?.includes("/carrito"));
  assert.deepEqual(rules.sitemap, ["https://revagt.com/sitemap.xml"]);
});

test("unfiltered numbered pages are self-canonical while filtered pages stay noindex", () => {
  const { getCatalogMetadataPolicy } = catalogSeo();

  assert.deepEqual(getCatalogMetadataPolicy({ pagina: "2" }), { canonical: "/catalogo?pagina=2", index: true });
  assert.deepEqual(getCatalogMetadataPolicy({ audiencia: "mujer", pagina: "2" }), { canonical: "/catalogo", index: false });
  assert.deepEqual(getCatalogMetadataPolicy({ pagina: "invalid" }), { canonical: "/catalogo", index: false });
});

test("sitemap slug collection requests bounded pages and stops after the final partial page", async () => {
  const { collectPublishedProductSlugs } = catalogSeo();
  const requests = [];
  const slugs = await collectPublishedProductSlugs(async (offset, limit) => {
    requests.push({ offset, limit });
    return offset === 0 ? Array.from({ length: limit }, (_, index) => `product-${index}`) : ["last-product"];
  }, { batchSize: 3, maximumProducts: 12 });

  assert.deepEqual(requests, [{ offset: 0, limit: 3 }, { offset: 3, limit: 3 }]);
  assert.equal(slugs.length, 4);
  assert.equal(slugs.at(-1), "last-product");
});

test("sitemap falls back to public static pages without leaking a catalog error", async () => {
  const { createPublicSitemap } = catalogSeo();
  const entries = await createPublicSitemap(async () => { throw new Error("private database detail"); });

  assert.ok(entries.some((entry) => entry.url === "https://revagt.com/catalogo"));
  assert.ok(entries.every((entry) => !entry.url.includes("private")));
});
