"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CollectionPreviewCard } from "@/features/home/components/CollectionPreviewCard";
import type { CollectionPreview } from "@/types/home";

type CollectionCarouselProps = Readonly<{ collections: CollectionPreview[] }>;

/**
 * Keeps featured collections discoverable without asking visitors to manage a horizontal scroller.
 * Embla owns the interaction details so this permanent production carousel remains accessible and reliable.
 */
export function CollectionCarousel({ collections }: CollectionCarouselProps) {
  const autoplay = useMemo(
    () => Autoplay({
      delay: 3500,
      stopOnFocusIn: true,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
    [],
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", loop: true },
    [autoplay],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const updateSelectedIndex = useCallback(() => {
    setSelectedIndex(emblaApi?.selectedScrollSnap() ?? 0);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", updateSelectedIndex);
    emblaApi.on("reInit", updateSelectedIndex);

    return () => {
      emblaApi.off("select", updateSelectedIndex);
      emblaApi.off("reInit", updateSelectedIndex);
    };
  }, [emblaApi, updateSelectedIndex]);

  const scrollPrevious = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  return (
    <section
      aria-label="Colecciones destacadas"
      aria-roledescription="carrusel"
      className="space-y-5"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrevious();
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      }}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <ul className="flex -ml-5 touch-pan-y">
          {collections.map((collection, index) => (
            <li
              aria-label={`${index + 1} de ${collections.length}`}
              aria-roledescription="diapositiva"
              className="min-w-0 shrink-0 grow-0 basis-[85%] pl-5 sm:basis-[52%] lg:basis-[35%]"
              key={collection.title}
              role="group"
            >
              <CollectionPreviewCard collection={collection} />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Colección {selectedIndex + 1} de {collections.length}
        </p>
        <div className="flex gap-2">
          <button
            aria-label="Ver colección anterior"
            className="inline-flex size-11 items-center justify-center rounded-full border border-sky-200 bg-white text-lg text-slate-950 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-cyan-700 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 active:translate-y-0"
            onClick={scrollPrevious}
            type="button"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            aria-label="Ver siguiente colección"
            className="inline-flex size-11 items-center justify-center rounded-full border border-sky-200 bg-white text-lg text-slate-950 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-cyan-700 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 active:translate-y-0"
            onClick={scrollNext}
            type="button"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
