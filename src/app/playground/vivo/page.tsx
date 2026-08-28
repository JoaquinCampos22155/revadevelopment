import type { Metadata } from "next";

import { ContemporaryPlayfulExploration } from "@/features/home-playground/components/HomeVisualExplorations";
import { getPlaygroundProduct } from "@/features/home-playground/server/real-home-playground-product";

export const metadata: Metadata = { title: "Playground vivo | REVA", robots: { follow: false, index: false } };

export default async function PlayfulPlaygroundPage() { return <ContemporaryPlayfulExploration product={await getPlaygroundProduct()} />; }
