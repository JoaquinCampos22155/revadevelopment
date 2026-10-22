const allowedDestinations = new Set([
  "/catalogo",
  "/iniciar-sesion",
  "/restablecer-contrasena",
]);

const allowedLoginErrors = new Set(["confirmacion", "restablecimiento"]);

function safeCallbackLocation(destination: URL): string {
  if (!allowedDestinations.has(destination.pathname)) {
    throw new Error("Unsupported Auth callback destination.");
  }

  const search = new URLSearchParams();
  const error = destination.searchParams.get("error");
  if (destination.pathname === "/iniciar-sesion" && error && allowedLoginErrors.has(error)) {
    search.set("error", error);
  }

  const query = search.toString();
  return query ? `${destination.pathname}?${query}` : destination.pathname;
}

/** Builds an allowlisted, origin-relative destination so proxy internals never become public URLs. */
export function getAuthCallbackRedirectLocation(destination: URL): string {
  return safeCallbackLocation(destination);
}
