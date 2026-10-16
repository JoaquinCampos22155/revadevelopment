import { useEffect, useRef, type PointerEvent, type SyntheticEvent } from "react";

import {
  calculateMagnifierPlacement,
  initialMagnifierState,
  transitionMagnifier,
} from "@/features/catalog/magnifier";

const LENS_SIZE = 160;

/** Adds mouse-only, frame-aligned magnification to a gallery without rerendering on pointer movement. */
export function useProductMagnifier() {
  const galleryRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const magnifierRef = useRef<HTMLDivElement>(null);
  const magnifierStateRef = useRef(initialMagnifierState);
  const supportsFineHoverRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const fineHover = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
    const updatePointerCapability = () => {
      supportsFineHoverRef.current = fineHover.matches;
      if (!fineHover.matches) {
        magnifierStateRef.current = transitionMagnifier(magnifierStateRef.current, { type: "capability-lost" }, false);
        if (magnifierRef.current) magnifierRef.current.style.visibility = "hidden";
      }
    };

    updatePointerCapability();
    fineHover.addEventListener("change", updatePointerCapability);
    return () => {
      fineHover.removeEventListener("change", updatePointerCapability);
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  function hideMagnifier() {
    magnifierStateRef.current = transitionMagnifier(magnifierStateRef.current, { type: "pointer-leave" }, supportsFineHoverRef.current);
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (magnifierRef.current) magnifierRef.current.style.visibility = "hidden";
  }

  function scheduleMagnifierUpdate() {
    if (!magnifierStateRef.current.active || !galleryRef.current || !imageRef.current || !magnifierRef.current) return;
    if (animationFrameRef.current !== null) return;

    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      const interaction = magnifierStateRef.current;
      const frameElement = galleryRef.current;
      const image = imageRef.current;
      const magnifier = magnifierRef.current;
      if (!interaction.active || !interaction.pointer || !interaction.source || !frameElement || !image || !magnifier || !image.naturalWidth || !image.naturalHeight) return;

      const placement = calculateMagnifierPlacement({
        frame: toRectangle(frameElement.getBoundingClientRect()),
        image: toRectangle(image.getBoundingClientRect()),
        lensSize: LENS_SIZE,
        naturalHeight: image.naturalHeight,
        naturalWidth: image.naturalWidth,
        pointer: interaction.pointer,
        source: interaction.source,
      });

      if (!placement) {
        magnifier.style.visibility = "hidden";
        return;
      }

      magnifier.style.width = `${placement.width}px`;
      magnifier.style.height = `${placement.height}px`;
      if (magnifier.dataset.source !== placement.source) {
        magnifier.style.backgroundImage = `url("${placement.source}")`;
        magnifier.dataset.source = placement.source;
      }
      magnifier.style.backgroundPosition = `${placement.backgroundPositionX}px ${placement.backgroundPositionY}px`;
      magnifier.style.backgroundSize = `${placement.backgroundSizeWidth}px ${placement.backgroundSizeHeight}px`;
      magnifier.style.transform = `translate3d(${placement.left}px, ${placement.top}px, 0)`;
      magnifier.style.visibility = "visible";
    });
  }

  function handlePointerEnter(event: PointerEvent<HTMLElement>) {
    const image = imageRef.current;
    if (!image) return;

    magnifierStateRef.current = transitionMagnifier(magnifierStateRef.current, {
      type: "pointer-enter",
      pointerType: event.pointerType,
      clientX: event.clientX,
      clientY: event.clientY,
      source: image.currentSrc || image.src,
    }, supportsFineHoverRef.current);
    if (magnifierStateRef.current.active) scheduleMagnifierUpdate();
    else hideMagnifier();
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const image = imageRef.current;
    if (!image) return;

    magnifierStateRef.current = transitionMagnifier(magnifierStateRef.current, {
      type: "pointer-move",
      pointerType: event.pointerType,
      clientX: event.clientX,
      clientY: event.clientY,
      source: image.currentSrc || image.src,
    }, supportsFineHoverRef.current);
    scheduleMagnifierUpdate();
  }

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    magnifierStateRef.current = transitionMagnifier(magnifierStateRef.current, {
      type: "image-change",
      source: image.currentSrc || image.src,
    }, supportsFineHoverRef.current);
    if (magnifierRef.current) magnifierRef.current.style.visibility = "hidden";
  }

  return {
    galleryRef,
    handleImageLoad,
    handlePointerEnter,
    handlePointerMove,
    hideMagnifier,
    imageRef,
    magnifierRef,
  };
}

function toRectangle(rectangle: DOMRect) {
  return {
    height: rectangle.height,
    left: rectangle.left,
    top: rectangle.top,
    width: rectangle.width,
  };
}
