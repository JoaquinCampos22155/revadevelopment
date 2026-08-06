/** Identifies a profile owned by an authenticated user. */
export type ProfileId = string;

/** Represents the business profile kept separate from an authentication provider identity. */
export type Profile = Readonly<{
  displayName: string | null;
  id: ProfileId;
}>;

/** Represents independently reversible communication preferences. */
export type MarketingPreferences = Readonly<{
  productUpdates: boolean;
  sustainabilityContent: boolean;
}>;

/** Limits profile changes to business data, never identity credentials or sessions. */
export type UpdateProfileInput = Readonly<{
  displayName: string | null;
  id: ProfileId;
}>;
