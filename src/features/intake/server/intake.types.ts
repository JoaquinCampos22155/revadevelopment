import type { Money } from "@/types/money";
import type { ProfileId } from "@/features/users/server/profile.types";

/** Identifies one physical garment received and processed by REVA. */
export type IntakeItemId = string;

/** Distinguishes a compensated garment intake from a donation. */
export type IntakeSourceType = "sell" | "donate";

/** Records REVA's decision for the physical garment after intake. */
export type IntakeDestination = "catalog" | "community_donation" | "textile_recycling";

/**
 * Represents physical-garment intake independently from a future catalog
 * Product. Acquisition cost remains internal operational information.
 */
export type IntakeItem = Readonly<{
  acquisitionCost: Money | null;
  createdAt: Date;
  createdByProfileId: ProfileId;
  destination: IntakeDestination | null;
  id: IntakeItemId;
  receivedAt: Date;
  sourceProfileId: ProfileId | null;
  sourceType: IntakeSourceType;
  updatedAt: Date;
}>;
