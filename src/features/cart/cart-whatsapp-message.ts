type CartContactProduct = Readonly<{ canonicalUrl: string; price: string; title: string }>;

function cleanLine(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
}

/** Formats only explicitly public information; operational IDs are not part of this contract. */
export function createCartWhatsAppMessage(products: ReadonlyArray<CartContactProduct>): string | null {
  if (products.length === 0 || products.length > 20) return null;
  let subtotalCents = 0;
  const lines = products.map((product) => {
    if (!/^\d+\.\d{2}$/.test(product.price)) return null;
    const canonicalUrl = new URL(product.canonicalUrl);
    if (canonicalUrl.protocol !== "https:" && canonicalUrl.hostname !== "localhost") return null;
    const [whole, fraction] = product.price.split(".");
    subtotalCents += Number(whole) * 100 + Number(fraction);
    const title = cleanLine(product.title);
    if (!title) return null;
    return `• ${title} — Q ${product.price}\n  ${canonicalUrl.toString()}`;
  });
  if (lines.some((line) => line === null)) return null;
  const subtotal = `Q ${Math.floor(subtotalCents / 100)}.${String(subtotalCents % 100).padStart(2, "0")}`;
  return `Hola, quiero comprar estas prendas de REVA:\n\n${lines.join("\n\n")}\n\nSubtotal de prendas: ${subtotal}`;
}
