/**
 * Keeps REVA's approved condition language in one presentation boundary while
 * preserving the numeric rating as the domain and persistence source of truth.
 */
export const conditionLabels = {
  0: "Con detalles",
  1: "Semi nuevo",
  2: "Como nuevo",
  3: "Nuevo",
} as const;

/** Identifies the compact condition scale used consistently across REVA. */
export type ConditionRating = keyof typeof conditionLabels;
