import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnvironment } from "@/infrastructure/config/environment";
import type { Database } from "@/infrastructure/supabase/database.types";

/**
 * Creates a request-scoped client for Server Components. Session refresh is
 * owned by the Next.js proxy because Server Components cannot write cookies.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { publishableKey, url } = getSupabaseEnvironment();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // The proxy refreshes sessions before Server Components render.
      },
    },
  });
}
