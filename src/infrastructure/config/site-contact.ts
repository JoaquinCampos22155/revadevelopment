import "server-only";

export type PublicProductContact = Readonly<{
  canonicalUrl: string | null;
  price: string;
  title: string;
}>;

function readWhatsAppNumber(): string | null {
  const rawValue = process.env.REVA_WHATSAPP_NUMBER?.trim();
  if (!rawValue) return null;

  const normalized = rawValue.replace(/[\s()+-]/g, "");
  return /^[1-9]\d{6,14}$/.test(normalized) ? normalized : null;
}

function readInstagramHandle(): string | null {
  const rawValue = process.env.REVA_INSTAGRAM_HANDLE?.trim();
  if (!rawValue) return null;

  const normalized = rawValue.startsWith("@") ? rawValue.slice(1) : rawValue;
  return /^[A-Za-z0-9._]{1,30}$/.test(normalized) ? normalized : null;
}

function createWhatsAppUrl(message: string): string | null {
  const number = readWhatsAppNumber();
  if (!number) return null;

  const url = new URL(`https://wa.me/${number}`);
  url.searchParams.set("text", message);
  return url.toString();
}

/** Resolves the optional public Instagram profile without allowing arbitrary destinations. */
export function getInstagramProfileUrl(): string | null {
  const handle = readInstagramHandle();
  return handle ? `https://www.instagram.com/${handle}/` : null;
}

/** Builds a product-interest message from only the approved public PDP contract. */
export function getWhatsAppProductInterestUrl(product: PublicProductContact): string | null {
  if (!product.canonicalUrl) return null;

  return createWhatsAppUrl(`Hola, quiero comprar esta prenda de REVA:\n\n${product.title}\n${product.price}\n${product.canonicalUrl}`);
}

/** Resolves the selling journey's optional official contact channel. */
export function getWhatsAppSellingUrl(): string | null {
  return createWhatsAppUrl("Hola, quiero vender una prenda con REVA.");
}
