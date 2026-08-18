import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { signOut } from "@/features/auth/server/auth.actions";
import { getCurrentUserProfile } from "@/features/users/server/current-user.service";

import "./globals.css";

export const metadata: Metadata = {
  title: "REVA",
  description: "Moda circular en Guatemala.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentProfile = await getCurrentUserProfile();

  return (
    <html lang="es">
      <body>
        <Navbar
          isAdmin={currentProfile?.role === "admin"}
          isAuthenticated={currentProfile !== null}
          onSignOut={signOut}
        />
        {children}
        <Footer />
      </body>
    </html>
  );
}
