import Image from "next/image";

import type { ProductImage } from "@/types/product";

type ProductGalleryProps = Readonly<{ images: ProductImage[] }>;

/** Displays product imagery together so future image assets can replace the gallery without layout changes. */
export function ProductGallery({ images }: ProductGalleryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {images.map((image, index) => (
        <figure className={index === 0 ? "sm:col-span-2" : ""} key={image.alt}>
          <Image
            alt={image.alt}
            className="aspect-[4/5] w-full rounded-3xl bg-sky-50 object-cover"
            priority={index === 0}
            src={image.src}
          />
        </figure>
      ))}
    </div>
  );
}
