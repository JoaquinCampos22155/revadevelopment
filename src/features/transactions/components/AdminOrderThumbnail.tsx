"use client";

import Image from "next/image";
import { useState } from "react";

type Thumbnail = Readonly<{ altText: string | null; height: number | null; imageId: string; url: string; width: number | null }> | null;

export function AdminOrderThumbnail({ thumbnail }: Readonly<{ thumbnail: Thumbnail }>) {
  const [failed, setFailed] = useState(false);

  if (!thumbnail || failed) {
    return <div aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-reva-surface text-xs font-semibold text-reva-secondary">REVA</div>;
  }

  return <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-reva-surface">
    <Image
      alt={thumbnail.altText?.trim() || "Prenda de la orden"}
      className="object-contain"
      height={thumbnail.height ?? 100}
      onError={() => setFailed(true)}
      sizes="64px"
      src={thumbnail.url}
      width={thumbnail.width ?? 80}
    />
  </div>;
}
