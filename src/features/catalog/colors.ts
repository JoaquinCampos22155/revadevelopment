/**
 * Defines REVA's current controlled color vocabulary for Product discovery.
 * Values are stable operational identifiers; labels remain Spanish presentation.
 */
export const colors = [
  { label: "Negro", value: "negro" },
  { label: "Blanco", value: "blanco" },
  { label: "Rojo", value: "rojo" },
  { label: "Azul", value: "azul" },
  { label: "Naranja", value: "naranja" },
  { label: "Amarillo", value: "amarillo" },
  { label: "Rosado", value: "rosado" },
  { label: "Celeste", value: "celeste" },
  { label: "Verde", value: "verde" },
  { label: "Morado", value: "morado" },
  { label: "Café", value: "cafe" },
  { label: "Beige", value: "beige" },
  { label: "Verde claro", value: "verde_claro" },
  { label: "Gris", value: "gris" },
  { label: "Dorado", value: "dorado" },
  { label: "Plateado", value: "plateado" },
  { label: "Bicolor", value: "bicolor" },
  { label: "Multicolor", value: "multicolor" },
] as const;

/** Represents a controlled color persisted through current Product Manager entry. */
export type Color = (typeof colors)[number]["value"];

/** Keeps server-side validation aligned with Product Manager's color selection. */
export function isColor(value: string): value is Color {
  return colors.some((color) => color.value === value);
}
