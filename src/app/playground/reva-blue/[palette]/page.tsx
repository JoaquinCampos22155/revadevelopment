import type { Metadata } from "next";

import { RevaBlueEditorialPlayground } from "@/features/home-playground/components/RevaBlueEditorialPlayground";
import { getPlaygroundProduct } from "@/features/home-playground/server/real-home-playground-product";

export const metadata: Metadata = { title: "REVA Blue Editorial | Playground", robots: { follow: false, index: false } };

type PageProps = Readonly<{ params: Promise<{ palette: string }>; searchParams: Promise<{ tema?: string }> }>;

/** Keeps palette experiments isolated from the production Home. */
export default async function RevaBluePlaygroundPage({ params, searchParams }: PageProps) {
  const [{ palette }, { tema }, product] = await Promise.all([params, searchParams, getPlaygroundProduct()]);
  const selectedPalette = palette === "b" || palette === "c" ? palette : "a";
  return <RevaBlueEditorialPlayground dark={tema === "oscuro"} palette={selectedPalette} product={product} />;
}
