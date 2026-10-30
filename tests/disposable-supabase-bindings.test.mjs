import test from "node:test";
import assert from "node:assert/strict";

import { arePublishedBindingsLoopback, isAttachedToIsolatedNetwork, sanitizeSupabaseEnvironment } from "../scripts/integration/start-isolated-supabase.mjs";

test("disposable Supabase ports accept loopback bindings only", () => {
  assert.equal(arePublishedBindingsLoopback({ "8000/tcp": [{ HostIp: "127.0.0.1", HostPort: "56420" }] }), true);
  assert.equal(arePublishedBindingsLoopback({ "5432/tcp": [{ HostIp: "::1", HostPort: "56421" }] }), true);
  assert.equal(arePublishedBindingsLoopback({ "5432/tcp": [{ HostIp: "0.0.0.0", HostPort: "56421" }] }), false);
  assert.equal(arePublishedBindingsLoopback({ "5432/tcp": [{ HostIp: "::", HostPort: "56421" }] }), false);
  assert.equal(arePublishedBindingsLoopback({ "5432/tcp": null }), true);
});

test("every published disposable port must belong to the reserved project range", () => {
  assert.equal(arePublishedBindingsLoopback({ "8000/tcp": [{ HostIp: "127.0.0.1", HostPort: "56420" }] }, 56420), true);
  assert.equal(arePublishedBindingsLoopback({ "8000/tcp": [{ HostIp: "127.0.0.1", HostPort: "54321" }] }, 56420), false);
});

test("disposable Supabase containers must use the named isolated network and not host networking", () => {
  assert.equal(isAttachedToIsolatedNetwork("reva-isolated-loopback", { "reva-isolated-loopback": {} }, "reva-isolated-loopback"), true);
  assert.equal(isAttachedToIsolatedNetwork("host", { "reva-isolated-loopback": {} }, "reva-isolated-loopback"), false);
  assert.equal(isAttachedToIsolatedNetwork("bridge", { bridge: {} }, "reva-isolated-loopback"), false);
  assert.equal(isAttachedToIsolatedNetwork("reva-isolated-loopback", { "reva-isolated-loopback": {}, bridge: {} }, "reva-isolated-loopback"), false);
});

test("disposable Supabase child processes do not inherit hosted connection or REVA key settings", () => {
  const sanitized = sanitizeSupabaseEnvironment({
    PATH: "safe-path",
    SUPABASE_DB_URL: "hosted-db-url-placeholder",
    SUPABASE_SERVICE_ROLE_KEY: "hosted-service-key-placeholder",
    DATABASE_URL: "hosted-database-url-placeholder",
    POSTGRES_PASSWORD: "hosted-password-placeholder",
    REVA_ENCRYPTION_KEY_V1: "local-key-placeholder",
    NEXT_PUBLIC_SUPABASE_URL: "hosted-api-url-placeholder",
  });
  assert.deepEqual(sanitized, { PATH: "safe-path" });
});
