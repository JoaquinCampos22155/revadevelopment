import assert from "node:assert/strict";
import test from "node:test";

const diagnosticModule = await import("../src/features/auth/auth-origin-diagnostic.ts").catch((error) => {
  if (error?.code === "ERR_MODULE_NOT_FOUND") return null;
  throw error;
});

test("Auth origin diagnostics are restricted to Render Auth entry GETs for the REVA service", () => {
  assert.equal(diagnosticModule?.shouldEmitAuthOriginDiagnostic?.({
    isRender: true,
    serviceName: "reva-gt",
    method: "GET",
    pathname: "/iniciar-sesion",
  }), true);
  assert.equal(diagnosticModule?.shouldEmitAuthOriginDiagnostic?.({
    isRender: true,
    serviceName: "reva-gt",
    method: "POST",
    pathname: "/iniciar-sesion",
  }), false);
  assert.equal(diagnosticModule?.shouldEmitAuthOriginDiagnostic?.({
    isRender: true,
    serviceName: "reva-gt",
    method: "GET",
    pathname: "/auth/confirm",
  }), false);
  assert.equal(diagnosticModule?.shouldEmitAuthOriginDiagnostic?.({
    isRender: false,
    serviceName: "reva-gt",
    method: "GET",
    pathname: "/recuperar-contrasena",
  }), false);
  assert.equal(diagnosticModule?.shouldEmitAuthOriginDiagnostic?.({
    isRender: true,
    serviceName: "other-service",
    method: "GET",
    pathname: "/recuperar-contrasena",
  }), false);
});

test("Auth origin diagnostic records expose only sanitized host and boolean metadata", () => {
  const record = diagnosticModule?.createAuthOriginDiagnosticRecord?.({
    requestUrl: "http://user:password@localhost:10000/iniciar-sesion?token=do-not-log&email=private@example.com",
    route: "/iniciar-sesion",
    forwardedHostPresent: true,
    officialOriginConfigured: true,
    redirectMatched: false,
    renderRequestId: "f24d0c80-711f-48da-91f2-03c8d37e5037",
  });

  assert.deepEqual(record, {
    event: "reva_auth_origin_diagnostic",
    diagnosticId: "f24d0c80-711f-48da-91f2-03c8d37e5037",
    diagnosticIdSource: "render_request_id",
    route: "/iniciar-sesion",
    hostname: "localhost",
    forwardedHostPresent: true,
    officialOriginConfigured: true,
    redirectMatched: false,
  });

  const serialized = JSON.stringify(record);
  assert.equal(serialized.includes("http://"), false);
  assert.equal(serialized.includes("password"), false);
  assert.equal(serialized.includes("token"), false);
  assert.equal(serialized.includes("private@example.com"), false);
});

test("Invalid URLs and untrusted request identifiers cannot inject diagnostic fields", () => {
  const record = diagnosticModule?.createAuthOriginDiagnosticRecord?.({
    requestUrl: "not a URL?token=hidden",
    route: "/recuperar-contrasena",
    forwardedHostPresent: false,
    officialOriginConfigured: false,
    redirectMatched: false,
    renderRequestId: "untrusted\nforged-entry",
  });

  assert.equal(record?.hostname, "<invalid>");
  assert.equal(record?.diagnosticIdSource, "generated");
  assert.match(record?.diagnosticId ?? "", /^[0-9a-f-]{36}$/i);
  assert.equal(JSON.stringify(record).includes("hidden"), false);
});
