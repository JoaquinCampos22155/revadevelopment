import { SupabaseProfileRepository } from "@/infrastructure/supabase/supabase-profile.repository";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

import type { Profile } from "@/features/users/server/profile.types";
import { UserService } from "@/features/users/server/user.service";

/**
 * Resolves the current request's Profile only after Supabase validates its
 * cookie-backed identity. This is the composition boundary for authenticated
 * Profile reads; UI code receives no provider client or persistence identity.
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.auth.getClaims();
  const profileId = error || !data ? null : data.claims?.sub;

  if (typeof profileId !== "string") {
    return null;
  }

  const profileRepository = new SupabaseProfileRepository(client, profileId);
  const userService = new UserService(profileRepository);

  return userService.getCurrentProfile();
}
