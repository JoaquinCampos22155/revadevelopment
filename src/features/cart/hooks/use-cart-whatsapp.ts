"use client";

import { useState } from "react";

import { createCartWhatsAppUrl } from "@/features/cart/server/cart.actions";

/** Revalidates before leaving REVA; stale/unavailable Products are never included. */
export function useCartWhatsApp(onUnavailable: () => void) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function continueToWhatsApp(slugs: ReadonlyArray<string>) {
    setPending(true);
    setError("");
    try {
      const result = await createCartWhatsAppUrl(slugs);
      if (result.unavailable) {
        setError("La selección cambió. Actualizamos su disponibilidad; revisa las prendas antes de continuar.");
        onUnavailable();
        return;
      }
      if (!result.url) {
        setError("WhatsApp no está disponible por el momento.");
        return;
      }
      window.location.assign(result.url);
    } catch {
      setError("No pudimos revisar tu selección. Intenta de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return { continueToWhatsApp, error, pending };
}
