/** Identifies REVA's business Profile, whose authentication identity is provider-owned. */
export type ProfileId = string;

/** Limits authorization to the two currently approved REVA roles. */
export type ProfileRole = "customer" | "admin";

/**
 * Represents REVA business identity and protected authorization state. Ordinary
 * profile updates must never be able to change role.
 */
export type Profile = Readonly<{
  createdAt: Date;
  id: ProfileId;
  role: ProfileRole;
  updatedAt: Date;
}>;

/** Represents the intentionally minimal, independently reversible consent record. */
export type MarketingPreferences = Readonly<{
  isMarketingOptedIn: boolean;
  profileId: ProfileId;
  updatedAt: Date;
}>;
