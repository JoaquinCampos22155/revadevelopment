import type { Profile } from "@/features/users/server/profile.types";

/**
 * Reads the Profile belonging to the authenticated request only. Ownership is
 * derived from the verified session, never from a browser-supplied identifier.
 */
export interface ProfileRepository {
  findCurrent(): Promise<Profile | null>;
}
