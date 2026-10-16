/**
 * Source-controlled geometry contract for a future licensed department map.
 * Coordinates must be projected into the shared 1000 × 700 SVG viewBox by an
 * approved data-preparation step; no geometry is bundled by this prototype.
 */
export type MunicipalityMapFeature = Readonly<{
  code: string;
  path: string;
  bounds: Readonly<{ x: number; y: number; width: number; height: number }>;
}>;

export type MunicipalityMapRenderModel = Readonly<{
  transform: string;
  selectedLabel: string;
  resetAvailable: boolean;
  features: readonly Readonly<MunicipalityMapFeature & { label: string; selected: boolean }>[];
}>;

export type MunicipalityMapLabel = Readonly<{ code: string; name: string }>;

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 700;
const MIN_FEATURE_ZOOM = 1;
const MAX_FEATURE_ZOOM = 5;

function getCameraTransform(bounds: MunicipalityMapFeature["bounds"] | undefined): string {
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) return "matrix(1 0 0 1 0 0)";

  const scale = Math.min(
    MAX_FEATURE_ZOOM,
    Math.max(MIN_FEATURE_ZOOM, Math.min(VIEWBOX_WIDTH / (bounds.width * 1.8), VIEWBOX_HEIGHT / (bounds.height * 1.8))),
  );
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  const translateX = VIEWBOX_WIDTH / 2 - centerX * scale;
  const translateY = VIEWBOX_HEIGHT / 2 - centerY * scale;

  return `matrix(${scale} 0 0 ${scale} ${translateX} ${translateY})`;
}

/** Pure render model shared by the SVG component and isolated geometry tests. */
export function createMunicipalityMapRenderModel(
  features: readonly MunicipalityMapFeature[],
  selectedCode: string,
  municipalities: readonly MunicipalityMapLabel[],
): MunicipalityMapRenderModel {
  const hasCompleteMunicipalitySet = features.length === municipalities.length
    && new Set(features.map(({ code }) => code)).size === municipalities.length
    && municipalities.every(({ code }) => features.some((feature) => feature.code === code));
  const hasValidGeometry = features.every(({ path, bounds }) => Boolean(path.trim())
    && Number.isFinite(bounds.x)
    && Number.isFinite(bounds.y)
    && Number.isFinite(bounds.width)
    && Number.isFinite(bounds.height)
    && bounds.width > 0
    && bounds.height > 0);

  if (!hasCompleteMunicipalitySet || !hasValidGeometry) {
    return {
      transform: "matrix(1 0 0 1 0 0)",
      selectedLabel: "El mapa aún no está disponible",
      resetAvailable: false,
      features: [],
    };
  }

  const knownFeatures = features.flatMap((feature) => {
    const label = municipalities.find((municipality) => municipality.code === feature.code)?.name;
    return label ? [{ ...feature, label, selected: feature.code === selectedCode }] : [];
  });
  const selectedFeature = knownFeatures.find((feature) => feature.selected);
  const selectedMunicipality = municipalities.find((municipality) => municipality.code === selectedCode)?.name;

  return {
    transform: getCameraTransform(selectedFeature?.bounds),
    selectedLabel: selectedMunicipality
      ? `Municipio seleccionado: ${selectedMunicipality}`
      : "Selecciona uno de los municipios disponibles",
    resetAvailable: Boolean(selectedFeature),
    features: knownFeatures,
  };
}
