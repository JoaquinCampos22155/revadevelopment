import assert from "node:assert/strict";
import test from "node:test";

const redirectModule = await import("../src/features/auth/auth-callback-redirect.ts").catch((error) => {
  if (error?.code === "ERR_MODULE_NOT_FOUND") return null;
  throw error;
});

test("Auth callback redirects use a relative Location, never the internal server origin", () => {
  const location = redirectModule?.getAuthCallbackRedirectLocation?.(
    new URL("https://localhost:10000/iniciar-sesion?error=confirmacion&code=secret"),
  );

  assert.equal(location, "/iniciar-sesion?error=confirmacion");
});

test("successful and recovery callback destinations remain on the request host", () => {
  assert.equal(
    redirectModule?.getAuthCallbackRedirectLocation?.(new URL("https://localhost:10000/catalogo")),
    "/catalogo",
  );
  assert.equal(
    redirectModule?.getAuthCallbackRedirectLocation?.(new URL("https://localhost:10000/restablecer-contrasena")),
    "/restablecer-contrasena",
  );
});

test("Auth callback redirects reject destinations outside the route allowlist", () => {
  assert.throws(
    () => redirectModule?.getAuthCallbackRedirectLocation?.(new URL("https://localhost:10000//attacker.example")),
    /Unsupported Auth callback destination/,
  );
});
