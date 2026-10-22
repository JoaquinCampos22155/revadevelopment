const renderHost = "reva-gt.onrender.com";

const safeQueryValues: Readonly<Record<string, Readonly<Record<string, readonly string[]>>>> = {
  "/iniciar-sesion": {
    error: ["credenciales", "confirmacion", "registro", "restablecimiento"],
    estado: ["confirma-correo", "contrasena-actualizada"],
  },
  "/recuperar-contrasena": {
    estado: ["solicitud-enviada"],
  },
  "/restablecer-contrasena": {
    error: ["contrasena"],
  },
};

type LegacyAuthRedirectInput = Readonly<{
  hasSupabaseSessionCookie: boolean;
  method: string;
  officialOrigin: string;
  requestUrl: string;
}>;

/** Redirects only legacy-host Auth page GETs, keeping callbacks and session-bound recovery on their origin. */
export function resolveLegacyAuthRedirect({
  hasSupabaseSessionCookie,
  method,
  officialOrigin,
  requestUrl,
}: LegacyAuthRedirectInput): string | null {
  if (method !== "GET") return null;

  let request: URL;
  let official: URL;

  try {
    request = new URL(requestUrl);
    official = new URL(officialOrigin);
  } catch {
    return null;
  }

  if (
    request.hostname !== renderHost
    || official.origin !== "https://revagt.com"
    || official.pathname !== "/"
    || official.search
    || official.hash
    || official.username
    || official.password
    || request.origin === official.origin
  ) {
    return null;
  }

  const allowedQuery = safeQueryValues[request.pathname];
  if (!allowedQuery) return null;
  if (request.pathname === "/restablecer-contrasena" && hasSupabaseSessionCookie) return null;

  const destination = new URL(request.pathname, official.origin);
  for (const [key, allowedValues] of Object.entries(allowedQuery)) {
    const value = request.searchParams.get(key);
    if (value && allowedValues.includes(value)) destination.searchParams.set(key, value);
  }

  return destination.toString();
}
