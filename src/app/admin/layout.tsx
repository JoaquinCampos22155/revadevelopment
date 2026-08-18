import type { Metadata } from "next";

import { requireCurrentAdmin } from "@/features/product-manager/server/admin-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
};

/** Keeps every internal Product Manager route behind the verified SSR admin boundary. */
export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireCurrentAdmin();
  return children;
}
