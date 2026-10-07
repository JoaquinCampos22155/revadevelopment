/** Detects the provider-verified authentication method for password recovery. */
export function hasPasswordRecoveryClaim(claims: unknown): boolean {
  if (typeof claims !== "object" || claims === null || !("amr" in claims)) {
    return false;
  }

  const methods = claims.amr;

  return Array.isArray(methods)
    && methods.some((method) => (
      typeof method === "object"
      && method !== null
      && "method" in method
      && method.method === "recovery"
    ));
}
