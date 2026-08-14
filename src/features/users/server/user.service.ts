import type { ProfileRepository } from "@/features/users/server/profile.repository";
import type { Profile } from "@/features/users/server/profile.types";

/**
 * Coordinates the current caller's business identity without exposing role
 * mutation or caller-controlled Profile lookup to application code.
 */
export class UserService {
  public constructor(private readonly profileRepository: ProfileRepository) {}

  public getCurrentProfile(): Promise<Profile | null> {
    return this.profileRepository.findCurrent();
  }
}
