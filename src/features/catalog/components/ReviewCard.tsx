import Image from "next/image";

import reviewAvatar from "@/assets/review-avatar.svg";
import { Text } from "@/components/ui/Text";
import type { ReviewPreview } from "@/types/catalog";

type ReviewCardProps = Readonly<{ review: ReviewPreview }>;

/** Renders a structured review preview that future review data can replace. */
export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="space-y-5 rounded-2xl border border-sky-100 bg-white p-6">
      <Text variant="body">“{review.quote}”</Text>
      <div className="flex items-center gap-3">
        <Image alt="Retrato editorial de la comunidad REVA" className="size-10" src={reviewAvatar} />
        <div>
          <p className="font-medium text-slate-950">{review.author}</p>
          <Text variant="label">{review.role}</Text>
        </div>
      </div>
    </article>
  );
}
