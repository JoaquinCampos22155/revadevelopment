import { redirect } from "next/navigation";

import type { Profile } from "@/features/users/server/profile.types";
import { getCurrentUserProfile } from "@/features/users/server/current-user.service";

/** Resolves administrator access from the verified SSR session, never browser state. */
export async function getCurrentAdminProfile(): Promise<Profile | null> {
  const profile = await getCurrentUserProfile();
  return profile?.role === "admin" ? profile : null;
}

/**
 * Protects internal routes without revealing Product Manager data to visitors
 * or customers. Server Actions repeat the non-redirecting check separately.
 */
export async function requireCurrentAdmin(): Promise<Profile> {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/iniciar-sesion");
  }

  if (profile.role !== "admin") {
    redirect("/");
  }

  return profile;
}
