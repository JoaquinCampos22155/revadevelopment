import type {
  MarketingPreferences,
  Profile,
  ProfileId,
  UpdateProfileInput,
} from "@/features/users/server/profile.types";

/** Owns future profile and preference use cases without taking responsibility for authentication sessions. */
export interface UserService {
  getMarketingPreferences(id: ProfileId): Promise<MarketingPreferences | null>;
  getProfile(id: ProfileId): Promise<Profile | null>;
  updateMarketingPreferences(id: ProfileId, preferences: MarketingPreferences): Promise<MarketingPreferences>;
  updateProfile(input: UpdateProfileInput): Promise<Profile>;
}
