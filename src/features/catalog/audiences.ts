/**
 * Defines REVA's stable single-audience classifications for Product entry.
 * Audience is merchandising data, not an assertion about a person's identity.
 */
export const audiences = [
  { label: "Hombre", value: "hombre" },
  { label: "Mujer", value: "mujer" },
  { label: "Niños", value: "ninos" },
  { label: "Unisex", value: "unisex" },
] as const;

/** Represents the controlled Product audience persisted by REVA. */
export type Audience = (typeof audiences)[number]["value"];

/** Keeps server-side Product Manager validation aligned with audience choices. */
export function isAudience(value: string): value is Audience {
  return audiences.some((audience) => audience.value === value);
}
