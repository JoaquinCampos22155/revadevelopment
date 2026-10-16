import type { Color } from "@/features/catalog/colors";

const colorAtmosphere: Readonly<Record<Color, string>> = {
  amarillo: "#c8a36d",
  azul: "#66818a",
  beige: "#c8a36d",
  bicolor: "#64747a",
  blanco: "#9d927d",
  cafe: "#967a63",
  celeste: "#7a9eaa",
  dorado: "#b5934e",
  gris: "#77868a",
  morado: "#897b91",
  multicolor: "#77868a",
  naranja: "#bd8866",
  negro: "#766e64",
  plateado: "#879398",
  rosado: "#ab7f89",
  rojo: "#78434b",
  verde: "#71846f",
  verde_claro: "#87977c",
};

/** Maps controlled public Product colors to a subtle, safe PDP atmosphere. */
export function getProductAtmosphere(color: string | null): string {
  return color && Object.hasOwn(colorAtmosphere, color)
    ? colorAtmosphere[color as Color]
    : "#64747a";
}
