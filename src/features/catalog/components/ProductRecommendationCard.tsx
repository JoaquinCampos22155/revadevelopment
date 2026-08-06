import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import type { ProductRecommendation } from "@/types/product";

type ProductRecommendationCardProps = Readonly<{
  recommendation: ProductRecommendation;
}>;

/** Creates an internal discovery path from one product page to another. */
export function ProductRecommendationCard({
  recommendation,
}: ProductRecommendationCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-sky-100 bg-white">
      <Image
        alt={recommendation.image.alt}
        className="aspect-[4/3] w-full object-cover"
        src={recommendation.image.src}
      />
      <div className="space-y-3 p-6">
        <Text variant="label">{recommendation.category}</Text>
        <h3 className="font-serif text-2xl tracking-tight">{recommendation.name}</h3>
        <Button href={`/productos/${recommendation.slug}`}>Ver detalle</Button>
      </div>
    </article>
  );
}
