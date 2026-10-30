import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { resolveLegacyAuthRedirect } from "@/features/auth/auth-origin-redirect";
import { getRevaSiteUrl } from "@/infrastructure/config/site";
import { updateSupabaseSession } from "@/infrastructure/supabase/proxy";
import { shouldRejectOversizedCheckoutAction } from "@/features/checkout/checkout-request-limits";

/** Canonicalizes legacy-host Auth entry GETs while preserving session-bound callbacks and mutations. */
export async function proxy(request: NextRequest) {
  if (shouldRejectOversizedCheckoutAction({
    contentLength: request.headers.get("content-length"),
    hasActionId: Boolean(request.headers.get("next-action")),
    method: request.method,
    pathname: request.nextUrl.pathname,
  })) {
    return new NextResponse(null, { status: 413, headers: { "Content-Length": "0" } });
  }

  const hasSupabaseSessionCookie = request.cookies.getAll().some(({ name }) => name.includes("-auth-token"));
  const officialOrigin = getRevaSiteUrl().origin;
  const destination = resolveLegacyAuthRedirect({
    hasSupabaseSessionCookie,
    method: request.method,
    officialOrigin,
    requestHost: request.headers.get("host"),
    requestUrl: request.url,
  });

  if (destination) return NextResponse.redirect(destination, 307);

  return updateSupabaseSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
