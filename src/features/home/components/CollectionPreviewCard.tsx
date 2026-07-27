import { Text } from "@/components/ui/Text";
import type { CollectionPreview } from "@/types/home";

type CollectionPreviewCardProps = Readonly<{
  collection: CollectionPreview;
}>;

/** Renders an editorial collection preview that can later receive catalog data. */
export function CollectionPreviewCard({
  collection,
}: CollectionPreviewCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-sky-100 bg-white">
      <div className="flex aspect-[4/3] items-end bg-sky-100 p-5">
        <Text className="rounded-full bg-white px-3 py-1" variant="label">
          Selección editorial
        </Text>
      </div>
      <div className="space-y-3 p-6">
        <h3 className="font-serif text-2xl tracking-tight">{collection.title}</h3>
        <Text variant="quiet">{collection.description}</Text>
      </div>
    </article>
  );
}
