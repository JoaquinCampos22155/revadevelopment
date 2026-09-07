/**
 * Keeps REVA's approved condition language in one presentation boundary while
 * preserving the numeric rating as the domain and persistence source of truth.
 */
export const conditionLabels = {
  1: "Con detalles",
  2: "Buen estado",
  3: "Como nuevo",
  4: "Nuevo con etiqueta",
} as const;

/** Identifies the compact condition scale used consistently across REVA. */
export type ConditionRating = keyof typeof conditionLabels;

/** Validates untrusted condition values before they enter catalog queries. */
export function isConditionRating(value: string): value is `${ConditionRating}` {
  return value === "1" || value === "2" || value === "3" || value === "4";
}
