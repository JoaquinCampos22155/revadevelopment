export type CheckoutContactProduct = Readonly<{
  canonicalUrl: string;
  price: string;
  title: string;
}>;

function cleanLine(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
}

/** Formats the public-only purchase inquiry; address, identity, and billing are not accepted. */
export function createCheckoutContactMessage(products: readonly CheckoutContactProduct[]): string | null {
  if (products.length === 0 || products.length > 20) return null;
  let subtotalCents = 0;
  const lines = products.map((product) => {
    if (!/^\d+\.\d{2}$/.test(product.price)) return null;
    const priceCents = Number(product.price.replace(".", ""));
    if (!Number.isSafeInteger(priceCents)) return null;
    const url = new URL(product.canonicalUrl);
    if (url.protocol !== "https:" && url.hostname !== "localhost") return null;
    const title = cleanLine(product.title);
    if (!title) return null;
    subtotalCents += priceCents;
    if (!Number.isSafeInteger(subtotalCents)) return null;
    return `• ${title} — Q ${product.price}\n  ${url.toString()}`;
  });

  if (lines.some((line) => line === null)) return null;
  const subtotal = `Q ${Math.floor(subtotalCents / 100)}.${String(subtotalCents % 100).padStart(2, "0")}`;
  return `REVA | Solicitud de compra\n\nPrendas:\n${lines.join("\n\n")}\n\nSubtotal de prendas: ${subtotal}\nEnvío: pendiente de confirmación.\n\nQuisiera confirmar disponibilidad y entrega, y recibir instrucciones para continuar con el pago.`;
}
