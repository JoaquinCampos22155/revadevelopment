import { Text } from "@/components/ui/Text";
import type { CollectionPreview } from "@/types/home";

type CollectionPreviewCardProps = Readonly<{ collection: CollectionPreview }>;

/** Renders a compact editorial collection preview whose hover treatment invites continued discovery. */
export function CollectionPreviewCard({ collection }: CollectionPreviewCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-sky-100 bg-white transition duration-300 ease-out hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/70">
      <div className="flex aspect-[4/3] items-end bg-sky-100 p-5 transition duration-500 ease-out group-hover:scale-[1.015]">
        <Text className="rounded-full bg-white px-3 py-1" variant="label">Selección editorial</Text>
      </div>
      <div className="space-y-3 p-6"><h3 className="font-serif text-2xl tracking-tight">{collection.title}</h3><Text variant="quiet">{collection.description}</Text></div>
    </article>
  );
}
