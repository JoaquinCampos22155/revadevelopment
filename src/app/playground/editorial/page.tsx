import type { Metadata } from "next";

import { FashionEditorialExploration } from "@/features/home-playground/components/HomeVisualExplorations";
import { getPlaygroundProduct } from "@/features/home-playground/server/real-home-playground-product";

export const metadata: Metadata = { title: "Playground editorial | REVA", robots: { follow: false, index: false } };

export default async function EditorialPlaygroundPage() { return <FashionEditorialExploration product={await getPlaygroundProduct()} />; }
