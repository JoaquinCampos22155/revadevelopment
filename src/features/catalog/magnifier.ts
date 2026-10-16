export type MagnifierPointer = Readonly<{ clientX: number; clientY: number }>;

export type MagnifierInteractionState = Readonly<{
  active: boolean;
  pointer: MagnifierPointer | null;
  source: string | null;
}>;

type MagnifierInteraction =
  | (Readonly<{ type: "pointer-enter" | "pointer-move"; pointerType: string; source: string }> & MagnifierPointer)
  | Readonly<{ type: "pointer-leave" }>
  | Readonly<{ type: "capability-lost" }>
  | Readonly<{ type: "image-change"; source: string }>;

export type MagnifierPlacement = Readonly<{
  backgroundPositionX: number;
  backgroundPositionY: number;
  backgroundSizeHeight: number;
  backgroundSizeWidth: number;
  height: number;
  left: number;
  source: string;
  top: number;
  width: number;
}>;

export type ImageRectangle = Readonly<{ left: number; top: number; width: number; height: number }>;

export const initialMagnifierState: MagnifierInteractionState = {
  active: false,
  pointer: null,
  source: null,
};

export function canActivateMagnifier(pointerType: string, supportsFineHover: boolean) {
  return pointerType === "mouse" && supportsFineHover;
}

export function transitionMagnifier(
  state: MagnifierInteractionState,
  interaction: MagnifierInteraction,
  supportsFineHover: boolean,
): MagnifierInteractionState {
  if (interaction.type === "image-change") {
    return { active: false, pointer: null, source: interaction.source };
  }

  if (interaction.type === "pointer-leave" || interaction.type === "capability-lost") {
    return { ...state, active: false, pointer: null };
  }

  if (!canActivateMagnifier(interaction.pointerType, supportsFineHover)) {
    return { ...state, active: false, pointer: null };
  }

  return {
    active: true,
    pointer: { clientX: interaction.clientX, clientY: interaction.clientY },
    source: interaction.source,
  };
}

export function calculateMagnifierPlacement({
  frame,
  image,
  lensSize,
  naturalHeight,
  naturalWidth,
  pointer,
  source,
}: Readonly<{
  frame: ImageRectangle;
  image: ImageRectangle;
  lensSize: number;
  naturalHeight: number;
  naturalWidth: number;
  pointer: MagnifierPointer;
  source: string;
}>): MagnifierPlacement | null {
  if (
    !source || lensSize <= 0 || naturalHeight <= 0 || naturalWidth <= 0 ||
    image.width <= 0 || image.height <= 0
  ) return null;

  const scale = Math.min(image.width / naturalWidth, image.height / naturalHeight);
  const photoWidth = naturalWidth * scale;
  const photoHeight = naturalHeight * scale;
  const photoLeft = image.left + (image.width - photoWidth) / 2;
  const photoTop = image.top + (image.height - photoHeight) / 2;
  const pointerX = pointer.clientX - photoLeft;
  const pointerY = pointer.clientY - photoTop;

  if (pointerX < 0 || pointerY < 0 || pointerX > photoWidth || pointerY > photoHeight) return null;

  const width = Math.min(lensSize, photoWidth, photoHeight);
  const height = width;
  const radius = width / 2;
  const centerX = clamp(pointerX, radius, photoWidth - radius);
  const centerY = clamp(pointerY, radius, photoHeight - radius);

  return {
    backgroundPositionX: radius - centerX * 2,
    backgroundPositionY: radius - centerY * 2,
    backgroundSizeHeight: photoHeight * 2,
    backgroundSizeWidth: photoWidth * 2,
    height,
    left: photoLeft - frame.left + centerX - radius,
    source,
    top: photoTop - frame.top + centerY - radius,
    width,
  };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}
