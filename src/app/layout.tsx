import type { Metadata } from "next";
import { headers } from "next/headers";

import revaIcon from "@/assets/reva-icon.svg";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { signOut } from "@/features/auth/server/auth.actions";
import { getCurrentUserProfile } from "@/features/users/server/current-user.service";
import { getRevaSiteUrl } from "@/infrastructure/config/site";
import { isWhatsAppConfigured } from "@/infrastructure/config/site-contact";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { CartProvider } from "@/features/cart/cart-context";

import "./globals.css";

export const metadata: Metadata = {
  title: "REVA",
  description: "Moda circular en Guatemala.",
  icons: { icon: revaIcon.src },
  metadataBase: getRevaSiteUrl(),
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
    <html data-scroll-behavior="smooth" lang="es">
      <body>
        {isPlayground ? children : <CartProvider>
        <Navbar
          isAdmin={currentProfile?.role === "admin"}
          isAuthenticated={currentProfile !== null}
          onSignOut={signOut}
        />
        {children}
        <Footer />
        <CartDrawer canContactOnWhatsApp={isWhatsAppConfigured()} />
        </CartProvider>}
      </body>
    </html>
  );
}
