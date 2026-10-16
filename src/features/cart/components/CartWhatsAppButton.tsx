"use client";

import { Button } from "@/components/ui/Button";
import { useCartWhatsApp } from "@/features/cart/hooks/use-cart-whatsapp";

type CartWhatsAppButtonProps = Readonly<{
  disabled?: boolean;
  onUnavailable: () => void;
  slugs: ReadonlyArray<string>;
}>;

export function CartWhatsAppButton({ disabled = false, onUnavailable, slugs }: CartWhatsAppButtonProps) {
  const { continueToWhatsApp, error, pending } = useCartWhatsApp(onUnavailable);
  return <div className="space-y-2">
    <Button className="w-full" disabled={disabled || pending || slugs.length === 0} onClick={() => void continueToWhatsApp(slugs)} variant="solid">{pending ? "Revisando tu selección…" : "Comprar selección por WhatsApp"}</Button>
    {error ? <p aria-live="polite" className="text-sm leading-5 text-reva-danger">{error}</p> : null}
  </div>;
}
