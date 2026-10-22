import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const manifestPath = ".next/server/functions-config-manifest.json";

test("production build registers the Node Proxy and its route matcher", {
  skip: !existsSync(manifestPath) && "requires a completed pnpm build",
}, () => {
  const middleware = readFileSync(".next/server/middleware.js", "utf8");
  const functionsManifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const nodeProxy = functionsManifest.functions?.["/_middleware"];

  assert.ok(nodeProxy, "Next.js functions manifest should register the Node Proxy");
  assert.equal(nodeProxy.runtime, "nodejs");
  assert.ok(nodeProxy.matchers?.length, "registered Proxy should have a matcher");

  const matcherConfig = nodeProxy.matchers[0];
  assert.equal(
    matcherConfig.originalSource,
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  );
  const manifestMatcher = new RegExp(matcherConfig.regexp);
  assert.equal(manifestMatcher.test("/iniciar-sesion"), true);
  assert.equal(manifestMatcher.test("/recuperar-contrasena"), true);
  assert.equal(manifestMatcher.test("/catalogo"), true);
  assert.equal(manifestMatcher.test("/_next/static/chunk.js"), false);
  assert.ok(middleware.length > 0, "Next.js should emit the production Proxy runtime entry");
});
