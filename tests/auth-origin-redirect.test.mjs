import assert from "node:assert/strict";
import test from "node:test";

const redirectModule = await import("../src/features/auth/auth-origin-redirect.ts").catch((error) => {
  if (error?.code === "ERR_MODULE_NOT_FOUND") return null;
  throw error;
});

function resolveRedirect(url, method = "GET", hasSupabaseSessionCookie = false) {
  return redirectModule?.resolveLegacyAuthRedirect?.({
    hasSupabaseSessionCookie,
    method,
    officialOrigin: "https://revagt.com",
    requestUrl: url,
  }) ?? null;
}

function resolveRedirectTo(url, officialOrigin) {
  return redirectModule?.resolveLegacyAuthRedirect?.({
    hasSupabaseSessionCookie: false,
    method: "GET",
    officialOrigin,
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
