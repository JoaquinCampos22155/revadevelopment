import type { Metadata } from "next";
import { headers } from "next/headers";

import revaIcon from "@/assets/reva-icon.svg";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { signOut } from "@/features/auth/server/auth.actions";
import { getCurrentUserProfile } from "@/features/users/server/current-user.service";

import "./globals.css";

export const metadata: Metadata = {
  title: "REVA",
  description: "Moda circular en Guatemala.",
  icons: { icon: revaIcon.src },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const isPlayground = (requestHeaders.get("x-reva-pathname") ?? "").startsWith("/playground");
  const currentProfile = await getCurrentUserProfile();

  return (
    <html lang="es">
      <body>
        {!isPlayground ? <Navbar
          isAdmin={currentProfile?.role === "admin"}
          isAuthenticated={currentProfile !== null}
          onSignOut={signOut}
        /> : null}
        {children}
        {!isPlayground ? <Footer /> : null}
      </body>
    </html>
  );
}
