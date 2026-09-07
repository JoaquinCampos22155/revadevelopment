/**
 * Defines the approved operational garment-type vocabulary in one place.
 * Values are stable Product data; labels may evolve without rewriting rows.
 */
export const garmentTypes = [
  { label: "Chumpas", value: "chumpas" },
  { label: "Hoodies y suéteres", value: "hoodies_sueteres" },
  { label: "Vestidos", value: "vestidos" },
  { label: "Camisas", value: "camisas" },
  { label: "Blusas y tops", value: "blusas_tops" },
  { label: "T-shirts", value: "t_shirts" },
  { label: "Pantalones y jeans", value: "pantalones" },
  { label: "Shorts", value: "shorts" },
  { label: "Pijamas", value: "pijamas" },
] as const;

/** Represents a controlled discovery value accepted by Product Manager. */
export type GarmentType = (typeof garmentTypes)[number]["value"];

/** Keeps server-side validation aligned with the Product Manager selection. */
export function isGarmentType(value: string): value is GarmentType {
  return garmentTypes.some((garmentType) => garmentType.value === value);
}
