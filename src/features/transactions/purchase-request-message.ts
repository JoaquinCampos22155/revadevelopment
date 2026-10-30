export type PurchaseRequestMessageItem = Readonly<{
  price: string;
  quantity: number;
  title: string;
}>;

export type PurchaseRequestMessageInput = Readonly<{
  items: readonly PurchaseRequestMessageItem[];
  publicReference: string;
  subtotal: string;
}>;

function cleanLine(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
}

/** Keeps personal data and Product URLs out of the customer-composed WhatsApp handoff. */
export function createPurchaseRequestMessage(input: PurchaseRequestMessageInput): string | null {
  if (!/^REVA-(?:[A-F0-9]{12}|[A-F0-9]{32})$/.test(input.publicReference) || input.items.length < 1 || input.items.length > 20) return null;
  if (!/^\d+\.\d{2}$/.test(input.subtotal)) return null;

  let subtotalCents = 0;
  const lines = input.items.map((item) => {
    const title = cleanLine(item.title);
    const priceCents = /^\d+\.\d{2}$/.test(item.price) ? Number(item.price.replace(".", "")) : NaN;
    if (!title || item.quantity !== 1 || !Number.isSafeInteger(priceCents)) return null;
    subtotalCents += priceCents;
    if (!Number.isSafeInteger(subtotalCents)) return null;
    return `• ${title} — Q ${item.price}`;
  });

  if (lines.some((line) => line === null)) return null;
  const [whole, fraction] = input.subtotal.split(".");
  if (subtotalCents !== Number(whole) * 100 + Number(fraction)) return null;

  return [
    "¡Hola, REVA! Acabo de completar una solicitud de compra en su página web.",
    "",
    `Mi referencia es ${input.publicReference}.`,
    "",
    "Me interesan las siguientes prendas:",
    ...lines,
    "",
    `Subtotal: Q ${input.subtotal}`,
    "Quisiera confirmar su disponibilidad y coordinar el pago. ¡Gracias!",
  ].join("\n");
}
