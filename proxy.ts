import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  createAuthOriginDiagnosticRecord,
  shouldEmitAuthOriginDiagnostic,
} from "@/features/auth/auth-origin-diagnostic";
import { resolveLegacyAuthRedirect } from "@/features/auth/auth-origin-redirect";
import { getRevaSiteUrl } from "@/infrastructure/config/site";
import { updateSupabaseSession } from "@/infrastructure/supabase/proxy";

function logAuthOriginDiagnostic(
  request: NextRequest,
  officialOriginConfigured: boolean,
  redirectMatched: boolean,
) {
  try {
    const record = createAuthOriginDiagnosticRecord({
      requestUrl: request.url,
      route: request.nextUrl.pathname,
      forwardedHostPresent: request.headers.has("x-forwarded-host"),
      officialOriginConfigured,
      redirectMatched,
      renderRequestId: request.headers.get("rndr-id"),
    });

    console.info(JSON.stringify(record));
  } catch {
    // Diagnostics must never change request handling.
  }
}

/** Canonicalizes legacy-host Auth entry GETs while preserving session-bound callbacks and mutations. */
export async function proxy(request: NextRequest) {
  const diagnoseOrigin = shouldEmitAuthOriginDiagnostic({
    isRender: process.env.RENDER === "true",
    serviceName: process.env.RENDER_SERVICE_NAME,
    method: request.method,
    pathname: request.nextUrl.pathname,
  });
  const hasSupabaseSessionCookie = request.cookies.getAll().some(({ name }) => name.includes("-auth-token"));
  let officialOrigin: string;

  try {
    officialOrigin = getRevaSiteUrl().origin;
  } catch (error) {
    if (diagnoseOrigin) logAuthOriginDiagnostic(request, false, false);
    throw error;
  }

  const destination = resolveLegacyAuthRedirect({
    hasSupabaseSessionCookie,
    method: request.method,
    officialOrigin,
    requestUrl: request.url,
  });

  if (diagnoseOrigin) logAuthOriginDiagnostic(request, true, Boolean(destination));

  if (destination) return NextResponse.redirect(destination, 307);

  return updateSupabaseSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
