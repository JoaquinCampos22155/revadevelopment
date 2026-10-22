import assert from "node:assert/strict";
import test from "node:test";

const redirectModule = await import("../src/features/auth/auth-origin-redirect.ts").catch((error) => {
  if (error?.code === "ERR_MODULE_NOT_FOUND") return null;
  throw error;
});

function resolveRedirect(
  url,
  method = "GET",
  hasSupabaseSessionCookie = false,
  requestHost = new URL(url).host,
) {
  return redirectModule?.resolveLegacyAuthRedirect?.({
    hasSupabaseSessionCookie,
    method,
    officialOrigin: "https://revagt.com",
    requestUrl: url,
    requestHost,
  }) ?? null;
}

function resolveRedirectTo(url, officialOrigin) {
  return redirectModule?.resolveLegacyAuthRedirect?.({
    hasSupabaseSessionCookie: false,
    method: "GET",
    officialOrigin,
    requestHost: new URL(url).host,
    requestUrl: url,
  }) ?? null;
}

test("Render login redirects to the official host while retaining only safe login status", () => {
  assert.equal(
    resolveRedirect("https://reva-gt.onrender.com/iniciar-sesion?error=credenciales&code=secret"),
    "https://revagt.com/iniciar-sesion?error=credenciales",
  );
});

test("Render password recovery redirects to the same official route", () => {
  assert.equal(
    resolveRedirect("https://reva-gt.onrender.com/recuperar-contrasena?estado=solicitud-enviada"),
    "https://revagt.com/recuperar-contrasena?estado=solicitud-enviada",
  );
});

test("Render redirect matches the validated incoming Host when Next uses an internal request URL", () => {
  assert.equal(
    resolveRedirect(
      "http://localhost:10000/iniciar-sesion",
      "GET",
      false,
      "reva-gt.onrender.com:10000",
    ),
    "https://revagt.com/iniciar-sesion",
  );
});

test("unrelated Host values do not trigger a canonical redirect", () => {
  assert.equal(
    resolveRedirect(
      "http://localhost:10000/iniciar-sesion",
      "GET",
      false,
      "attacker.example",
    ),
    null,
  );
});

test("malformed or userinfo-bearing Host values cannot spoof the legacy host", () => {
  for (const requestHost of [
    "reva-gt.onrender.com.attacker.example",
    "attacker@reva-gt.onrender.com",
    "reva-gt.onrender.com/attacker",
    "reva-gt.onrender.com,attacker.example",
  ]) {
    assert.equal(
      resolveRedirect("http://localhost:10000/iniciar-sesion", "GET", false, requestHost),
      null,
      requestHost,
    );
  }
});

test("Render reset redirect preserves a possible session cookie origin", () => {
  assert.equal(
    resolveRedirect("https://reva-gt.onrender.com/restablecer-contrasena", "GET", true),
    null,
  );
});

test("Render reset navigation without a session redirects to the official route", () => {
  assert.equal(
    resolveRedirect("https://reva-gt.onrender.com/restablecer-contrasena?error=contrasena"),
    "https://revagt.com/restablecer-contrasena?error=contrasena",
  );
});

test("Server Action POSTs and Auth callbacks are never redirected", () => {
  assert.equal(resolveRedirect("https://reva-gt.onrender.com/iniciar-sesion", "POST"), null);
  assert.equal(resolveRedirect("https://reva-gt.onrender.com/auth/confirm?code=secret"), null);
});

test("Other Render pages and requests already on the official host are not redirected", () => {
  assert.equal(resolveRedirect("https://reva-gt.onrender.com/catalogo"), null);
  assert.equal(resolveRedirect("https://revagt.com/iniciar-sesion"), null);
});

test("Redirect destination must be the approved HTTPS canonical origin", () => {
  assert.equal(
    resolveRedirectTo("https://reva-gt.onrender.com/iniciar-sesion", "https://attacker.example"),
    null,
  );
  assert.equal(
    resolveRedirectTo("https://reva-gt.onrender.com/iniciar-sesion", "http://localhost:3000"),
    null,
  );
});
