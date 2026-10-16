"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";

import { useProductMagnifier } from "@/features/catalog/components/useProductMagnifier";
import type { ProductImage } from "@/types/product";

type ProductGalleryProps = Readonly<{ images: ReadonlyArray<ProductImage> }>;

/** Lets visitors inspect published Product photographs without moving data access into the browser. */
export function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const touchStart = useRef<Readonly<{ x: number; y: number }> | null>(null);
  const {
    galleryRef,
    handleImageLoad,
    handlePointerEnter,
    handlePointerMove,
    hideMagnifier,
    imageRef,
    magnifierRef,
  } = useProductMagnifier();
  const zoomDialogRef = useRef<HTMLDialogElement>(null);
  const activeImage = images[activeIndex];

  function selectAdjacentImage(direction: -1 | 1) {
    hideMagnifier();
    setActiveIndex((current) => Math.min(Math.max(current + direction, 0), images.length - 1));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectAdjacentImage(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectAdjacentImage(1);
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;
    if (!start || !touch) return;

    const horizontalDistance = touch.clientX - start.x;
    const verticalDistance = touch.clientY - start.y;
    if (Math.abs(horizontalDistance) < 44 || Math.abs(horizontalDistance) < Math.abs(verticalDistance) * 1.25) return;
    selectAdjacentImage(horizontalDistance < 0 ? 1 : -1);
  }

  if (!activeImage) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-reva-muted text-sm text-reva-secondary" role="status">
        Fotografía no disponible
      </div>
    );
  }

  const activeDimensions = getImageDimensions(activeImage);

  function openZoom() {
    hideMagnifier();
    setZoomLevel(1);
    zoomDialogRef.current?.showModal();
  }

  return (
    <section aria-label="Galería de fotografías del producto" className="reva-pdp-gallery-section min-w-0 space-y-3">
      <figure
        aria-label={`Foto ${activeIndex + 1} de ${images.length}`}
        className="reva-pdp-gallery relative isolate w-full overflow-hidden"
        ref={galleryRef}
        style={{ aspectRatio: `${activeDimensions.width} / ${activeDimensions.height}` }}
        onKeyDown={images.length > 1 ? handleKeyDown : undefined}
        onPointerCancel={hideMagnifier}
        onPointerLeave={hideMagnifier}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onTouchEnd={images.length > 1 ? handleTouchEnd : undefined}
        onTouchStart={images.length > 1 ? handleTouchStart : undefined}
        tabIndex={images.length > 1 ? 0 : undefined}
      >
        <Image
          alt={activeImage.alt}
          className="reva-pdp-image h-full w-full object-contain"
          height={activeDimensions.height}
          key={`${activeImage.alt}-${activeIndex}`}
          loading={activeIndex === 0 ? "eager" : "lazy"}
          fetchPriority={activeIndex === 0 ? "high" : undefined}
          ref={imageRef}
          sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(100vw - 3rem), (max-width: 1359px) 46vw, 640px"
          src={activeImage.src}
          onLoad={handleImageLoad}
          width={activeDimensions.width}
        />

        {images.length > 1 ? (
          <>
            <span aria-hidden="true" className="reva-pdp-image-count absolute right-3 top-3 bg-reva-background/95 px-3 py-1 text-xs tabular-nums text-reva-primary shadow-sm backdrop-blur-sm sm:right-4 sm:top-4">
              {activeIndex + 1} <span className="px-1 text-reva-secondary">/</span> {images.length}
            </span>
            <div className="reva-pdp-gallery-navigation absolute inset-y-0 inset-x-3 flex items-center justify-between sm:inset-x-4">
              <button
                aria-label="Ver fotografía anterior"
                className="reva-pdp-gallery-control"
                disabled={activeIndex === 0}
                onClick={() => selectAdjacentImage(-1)}
                type="button"
              >
                <Chevron direction="left" />
              </button>
              <button
                aria-label="Ver fotografía siguiente"
                className="reva-pdp-gallery-control"
                disabled={activeIndex === images.length - 1}
                onClick={() => selectAdjacentImage(1)}
                type="button"
              >
                <Chevron direction="right" />
              </button>
            </div>
          </>
        ) : null}

        <button
          aria-label={`Ampliar fotografía ${activeIndex + 1}`}
          className="reva-pdp-gallery-control reva-pdp-zoom-trigger absolute left-3 top-3 sm:left-4 sm:top-4"
          onClick={openZoom}
          type="button"
        >
          <ZoomIcon />
        </button>

        <div aria-hidden="true" className="reva-pdp-magnifier" ref={magnifierRef} />
      </figure>

      <p aria-atomic="true" className="sr-only" role="status">
        Foto {activeIndex + 1} de {images.length}
      </p>

      {images.length > 1 ? (
        <div aria-label="Seleccionar fotografía" className="reva-pdp-thumbnails" role="group">
          {images.map((image, index) => (
            <Thumbnail
              active={index === activeIndex}
              image={image}
              index={index}
              key={`${image.alt}-${index}`}
              onSelect={() => { hideMagnifier(); setActiveIndex(index); }}
              total={images.length}
            />
          ))}
        </div>
      ) : null}

      <dialog
        aria-label={`Fotografía ${activeIndex + 1} ampliada`}
        className="reva-pdp-zoom-dialog"
        onClick={(event) => { if (event.target === zoomDialogRef.current) zoomDialogRef.current.close(); }}
        ref={zoomDialogRef}
      >
        <button
          aria-label="Cerrar fotografía ampliada"
          autoFocus
          className="reva-pdp-zoom-close"
          onClick={() => zoomDialogRef.current?.close()}
          type="button"
        >
          <CloseIcon />
        </button>
        <div className={`reva-pdp-zoom-stage${zoomLevel > 1 ? " is-zoomed" : ""}`} tabIndex={zoomLevel > 1 ? 0 : -1}>
          <Image
            alt={activeImage.alt}
            className="reva-pdp-zoom-image"
            height={activeDimensions.height}
            sizes={`${zoomLevel * 96}vw`}
            src={activeImage.src}
            width={activeDimensions.width}
          />
        </div>
        <div aria-label="Controles de ampliación" className="reva-pdp-zoom-controls" role="group">
          <button aria-label="Reducir fotografía" className="reva-pdp-zoom-control" disabled={zoomLevel === 1} onClick={() => setZoomLevel((level) => Math.max(1, level - 0.5))} type="button">−</button>
          <span aria-live="polite" className="min-w-12 text-center text-xs tabular-nums text-white">{Math.round(zoomLevel * 100)}%</span>
          <button aria-label="Ampliar fotografía" className="reva-pdp-zoom-control" disabled={zoomLevel === 2} onClick={() => setZoomLevel((level) => Math.min(2, level + 0.5))} type="button">+</button>
        </div>
      </dialog>
    </section>
  );
}

function Thumbnail({
  active,
  image,
  index,
  onSelect,
  total,
}: Readonly<{
  active: boolean;
  image: ProductImage;
  index: number;
  onSelect: () => void;
  total: number;
}>) {
  const dimensions = getImageDimensions(image);

  return (
    <button
      aria-label={`Ver foto ${index + 1} de ${total}`}
      aria-pressed={active}
      className="reva-pdp-thumbnail"
      onClick={onSelect}
      type="button"
    >
      <Image alt="" className="h-full w-full object-cover" height={dimensions.height} loading="lazy" sizes="72px" src={image.src} width={dimensions.width} />
    </button>
  );
}

function getImageDimensions(image: ProductImage): Readonly<{ height: number; width: number }> {
  return "height" in image
    ? { height: image.height, width: image.width }
    : { height: image.src.height, width: image.src.width };
}

function Chevron({ direction }: Readonly<{ direction: "left" | "right" }>) {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d={direction === "left" ? "m14.5 5-7 7 7 7" : "m9.5 5 7 7-7 7"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

function ZoomIcon() {
  return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.1" stroke="currentColor" strokeWidth="1.6" /><path d="m15.3 15.3 4.2 4.2M10.8 8.2v5.2m-2.6-2.6h5.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></svg>;
}

function CloseIcon() {
  return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="m6.5 6.5 11 11m0-11-11 11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></svg>;
}
