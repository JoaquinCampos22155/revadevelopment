import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnvironment } from "@/infrastructure/config/environment";

/**
 * Creates a request-scoped Supabase client so future repositories depend on
 * infrastructure instead of sharing provider state between server requests.
 *
 * Authentication is deliberately outside Sprint 12. This client only reads
 * request cookies; a writable middleware client will be introduced with Auth.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { publishableKey, url } = getSupabaseEnvironment();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
    },
  });
}
