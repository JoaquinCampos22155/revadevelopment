import type {
  MarketingPreferences,
  Profile,
  ProfileId,
} from "@/features/users/server/profile.types";

/** Defines persistence for REVA profile data and preferences independently from authentication. */
export interface ProfileRepository {
  findById(id: ProfileId): Promise<Profile | null>;
  getMarketingPreferences(id: ProfileId): Promise<MarketingPreferences | null>;
  save(profile: Profile): Promise<Profile>;
  saveMarketingPreferences(id: ProfileId, preferences: MarketingPreferences): Promise<MarketingPreferences>;
}
