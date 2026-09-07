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

/** Maps controlled Product color classifications to safe, presentational swatches. */
export const colorSwatches: Readonly<Record<Color, string>> = {
  amarillo: "#f2c94c",
  azul: "#4d7ea8",
  beige: "#d9c7a4",
  bicolor: "linear-gradient(135deg, #71928e 0 50%, #d9c7a4 50% 100%)",
  blanco: "#f8faf8",
  cafe: "#765341",
  celeste: "#90c7df",
  dorado: "#c69b3c",
  gris: "#8a9292",
  morado: "#7a5b9a",
  multicolor: "linear-gradient(135deg, #e06d5b 0 25%, #f2c94c 25% 50%, #71928e 50% 75%, #7a5b9a 75% 100%)",
  naranja: "#e78143",
  negro: "#1f2933",
  plateado: "#bdc7ce",
  rosado: "#d8859b",
  rojo: "#bd4f4f",
  verde: "#4f8a68",
  verde_claro: "#98b976",
};

/** Keeps server-side validation aligned with Product Manager's color selection. */
export function isColor(value: string): value is Color {
  return colors.some((color) => color.value === value);
}
