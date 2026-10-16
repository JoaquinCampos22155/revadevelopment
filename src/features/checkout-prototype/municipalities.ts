/** INE 2025 codes/names for the 17 municipalities in Guatemala department. */
export const GUATEMALA_MUNICIPALITIES = [
  { code: "0101", name: "Guatemala" },
  { code: "0102", name: "Santa Catarina Pinula" },
  { code: "0103", name: "San José Pinula" },
  { code: "0104", name: "San José del Golfo" },
  { code: "0105", name: "Palencia" },
  { code: "0106", name: "Chinautla" },
  { code: "0107", name: "San Pedro Ayampuc" },
  { code: "0108", name: "Mixco" },
  { code: "0109", name: "San Pedro Sacatepéquez" },
  { code: "0110", name: "San Juan Sacatepéquez" },
  { code: "0111", name: "San Raymundo" },
  { code: "0112", name: "Chuarrancho" },
  { code: "0113", name: "Fraijanes" },
  { code: "0114", name: "Amatitlán" },
  { code: "0115", name: "Villa Nueva" },
  { code: "0116", name: "Villa Canales" },
  { code: "0117", name: "San Miguel Petapa" },
] as const;

export type GuatemalaMunicipalityCode = (typeof GUATEMALA_MUNICIPALITIES)[number]["code"];

export type VerifiedZoneCatalog = Readonly<{
  zones: readonly number[];
  sourceLabel: string;
  sourceUrl: string;
}>;

/**
 * Textual zone identifiers supported by municipal sources. These are not
 * delivery-coverage claims or licensed boundary geometries.
 */
export const VERIFIED_ZONE_CATALOGS: Partial<Record<GuatemalaMunicipalityCode, VerifiedZoneCatalog>> = {
  "0101": {
    zones: [...Array.from({ length: 19 }, (_, index) => index + 1), 21, 24, 25],
    sourceLabel: "Municipalidad de Guatemala · Plan de Ordenamiento Territorial",
    sourceUrl: "https://especiales.muniguate.com/pot2010/mapa.php",
  },
  "0108": {
    zones: Array.from({ length: 11 }, (_, index) => index + 1),
    sourceLabel: "Municipalidad de Mixco · alcaldías auxiliares en sus 11 zonas",
    sourceUrl: "https://www2.munimixco.gob.gt/?p=7562",
  },
  "0117": {
    zones: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13],
    sourceLabel: "Municipalidad de San Miguel Petapa / SEGEPLAN · PDM-OT 2020, Mapa 14",
    sourceUrl: "https://www.munisanmiguelpetapa.gob.gt/files/PDM_OT_SAN_MIGUEL_PETAPA-2020.pdf",
  },
};

export function findGuatemalaMunicipality(code: string) {
  return GUATEMALA_MUNICIPALITIES.find((municipality) => municipality.code === code);
}

export function getVerifiedZoneCatalog(code: string) {
  return VERIFIED_ZONE_CATALOGS[code as GuatemalaMunicipalityCode];
}
