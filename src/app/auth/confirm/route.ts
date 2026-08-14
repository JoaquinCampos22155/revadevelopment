import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseEnvironment } from "@/infrastructure/config/environment";

/**
 * Exchanges the email-confirmation token for a cookie-backed session before
 * redirecting, which keeps verification out of browser JavaScript and URLs.
 */
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const redirectUrl = request.nextUrl.clone();

  redirectUrl.pathname = "/catalogo";
  redirectUrl.search = "";

  const response = NextResponse.redirect(redirectUrl);
  const { publishableKey, url } = getSupabaseEnvironment();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  if (!tokenHash || !type) {
    redirectUrl.pathname = "/iniciar-sesion";
    redirectUrl.searchParams.set("error", "confirmacion");
    return NextResponse.redirect(redirectUrl);
  }

  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error) {
    redirectUrl.pathname = "/iniciar-sesion";
    redirectUrl.searchParams.set("error", "confirmacion");
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
