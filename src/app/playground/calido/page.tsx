import type { Metadata } from "next";

import { WarmEditorialExploration } from "@/features/home-playground/components/HomeVisualExplorations";
import { getPlaygroundProduct } from "@/features/home-playground/server/real-home-playground-product";

export const metadata: Metadata = { title: "Playground cálido | REVA", robots: { follow: false, index: false } };

export default async function WarmPlaygroundPage() { return <WarmEditorialExploration product={await getPlaygroundProduct()} />; }
