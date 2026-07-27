import Image from "next/image";

import collectionCover from "@/assets/collection-cover.svg";
import { Text } from "@/components/ui/Text";
import type { CatalogCollection } from "@/types/catalog";

type CollectionCardProps = Readonly<{ collection: CatalogCollection }>;

/** Renders an editorial collection preview without pretending inventory exists. */
export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-sky-100 bg-white">
      <Image
        alt={`Portada editorial de ${collection.title}`}
        className="aspect-[4/3] w-full object-cover"
        src={collectionCover}
      />
      <div className="space-y-3 p-6">
        <Text variant="label">Selección REVA</Text>
        <h2 className="font-serif text-2xl tracking-tight">{collection.title}</h2>
        <Text variant="quiet">{collection.description}</Text>
      </div>
    </article>
  );
}
