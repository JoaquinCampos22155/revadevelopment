const diagnosticRoutes = new Set(["/iniciar-sesion", "/recuperar-contrasena"]);

type DiagnosticScope = Readonly<{
  isRender: boolean;
  serviceName: string | undefined;
  method: string;
  pathname: string;
}>;

type DiagnosticRecordInput = Readonly<{
  requestUrl: string;
  route: string;
  forwardedHostPresent: boolean;
  officialOriginConfigured: boolean;
  redirectMatched: boolean;
  renderRequestId: string | null;
}>;

export type AuthOriginDiagnosticRecord = Readonly<{
  event: "reva_auth_origin_diagnostic";
  diagnosticId: string;
  diagnosticIdSource: "render_request_id" | "generated";
  route: string;
  hostname: string;
  forwardedHostPresent: boolean;
  officialOriginConfigured: boolean;
  redirectMatched: boolean;
}>;

/** Temporary diagnostics: emit only for low-volume Auth entry GETs on REVA's Render service. */
export function shouldEmitAuthOriginDiagnostic({
  isRender,
  serviceName,
  method,
  pathname,
}: DiagnosticScope): boolean {
  return isRender
    && serviceName === "reva-gt"
    && method === "GET"
    && diagnosticRoutes.has(pathname);
}

/** Builds a log-safe record; request URL data is reduced to a validated hostname. */
export function createAuthOriginDiagnosticRecord({
  requestUrl,
  route,
  forwardedHostPresent,
  officialOriginConfigured,
  redirectMatched,
  renderRequestId,
}: DiagnosticRecordInput): AuthOriginDiagnosticRecord {
  let hostname = "<invalid>";

  try {
    const candidate = new URL(requestUrl).hostname.toLowerCase();
    if (/^[a-z0-9.-]{1,253}$/.test(candidate)) hostname = candidate;
  } catch {
    // Keep malformed input out of logs and preserve the request's normal handling.
  }

  const safeRequestId = renderRequestId?.trim();
  const hasSafeRequestId = Boolean(safeRequestId && /^[a-f0-9-]{16,64}$/i.test(safeRequestId));

  return {
    event: "reva_auth_origin_diagnostic",
    diagnosticId: hasSafeRequestId ? safeRequestId! : globalThis.crypto.randomUUID(),
    diagnosticIdSource: hasSafeRequestId ? "render_request_id" : "generated",
    route: diagnosticRoutes.has(route) ? route : "<other>",
    hostname,
    forwardedHostPresent,
    officialOriginConfigured,
    redirectMatched,
  };
}
