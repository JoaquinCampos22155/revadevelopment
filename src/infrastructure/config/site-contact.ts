function readWhatsAppNumber(): string | null {
  const value = process.env.REVA_WHATSAPP_NUMBER?.replace(/\D/g, "");
  return value ? value : null;
}

/** Resolves the future official contact channel without inventing a destination. */
export function getWhatsAppSellingUrl(): string | null {
  const number = readWhatsAppNumber();
  if (!number) return null;

  return `https://wa.me/${number}?text=${encodeURIComponent("Hola, quiero vender una prenda con REVA.")}`;
}
