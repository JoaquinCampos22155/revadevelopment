/**
 * Defines the approved operational garment-type vocabulary in one place.
 * Values are stable Product data; labels may evolve without rewriting rows.
 */
export const garmentTypes = [
  { label: "Chumpas", value: "chumpas" },
  { label: "Hoodies y Suéteres", value: "hoodies_sueteres" },
  { label: "Vestidos", value: "vestidos" },
  { label: "Camisas", value: "camisas" },
  { label: "T-Shirts", value: "t_shirts" },
  { label: "Pantalones", value: "pantalones" },
  { label: "Jeans", value: "jeans" },
  { label: "Pijamas", value: "pijamas" },
] as const;

/** Represents a controlled discovery value accepted by Product Manager. */
export type GarmentType = (typeof garmentTypes)[number]["value"];

/** Keeps server-side validation aligned with the Product Manager selection. */
export function isGarmentType(value: string): value is GarmentType {
  return garmentTypes.some((garmentType) => garmentType.value === value);
}
