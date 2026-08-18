/**
 * Defines REVA's current controlled alpha-size entry vocabulary. It is not a
 * universal sizing model and deliberately leaves room for future systems.
 */
export const productSizes = [
  { label: "XXS", value: "XXS" },
  { label: "XS", value: "XS" },
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
  { label: "XXL", value: "XXL" },
] as const;

/** Represents a currently approved controlled size captured by Product Manager. */
export type ProductSize = (typeof productSizes)[number]["value"];

/** Keeps server-side validation aligned with the Product Manager size selection. */
export function isProductSize(value: string): value is ProductSize {
  return productSizes.some((size) => size.value === value);
}
