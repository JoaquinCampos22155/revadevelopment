import type { MetadataRoute } from "next";

const officialOrigin = "https://revagt.com";
const maximumSingleSitemapProductCount = 49_000;
const indexableStaticPaths = [
  "/",
  "/catalogo",
  "/como-funciona",
  "/vender",
  "/donar",
  "/terminos",
  "/privacidad",
  "/preguntas-frecuentes",
] as const;

type CatalogMetadataParams = Readonly<Record<string, string | ReadonlyArray<string> | undefined>>;

/** Produces only REVA's canonical public pages and slugs from the published-product projection. */
export function createPublicSitemapEntries(productSlugs: ReadonlyArray<string>): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = indexableStaticPaths.map((path) => ({ url: new URL(path, officialOrigin).toString() }));
  const uniqueSlugs = [...new Set(productSlugs)].filter((slug) => slug.length > 0);
  return [
    ...staticEntries,
    ...uniqueSlugs.map((slug) => ({ url: new URL(`/productos/${encodeURIComponent(slug)}`, officialOrigin).toString() })),
  ];
}

export async function collectPublishedProductSlugs(
  readPage: (offset: number, limit: number) => Promise<ReadonlyArray<string>>,
  options: Readonly<{ batchSize?: number; maximumProducts?: number }> = {},
): Promise<ReadonlyArray<string>> {
  const batchSize = options.batchSize ?? 500;
  const maximumProducts = options.maximumProducts ?? maximumSingleSitemapProductCount;
  if (!Number.isSafeInteger(batchSize) || batchSize < 1 || !Number.isSafeInteger(maximumProducts) || maximumProducts < 1) {
    throw new Error("Invalid sitemap Product paging configuration.");
  }

  const slugs: string[] = [];
  while (slugs.length < maximumProducts) {
    const limit = Math.min(batchSize, maximumProducts - slugs.length + 1);
    const rows = await readPage(slugs.length, limit);
    if (rows.length > maximumProducts - slugs.length) {
      throw new Error("Published Product sitemap exceeds the single-file URL limit.");
    }
    slugs.push(...rows);
    if (rows.length < limit) return slugs;
  }

  return slugs;
}

export async function createPublicSitemap(
  readPublishedSlugs: () => Promise<ReadonlyArray<string>>,
): Promise<MetadataRoute.Sitemap> {
  try {
    return createPublicSitemapEntries(await readPublishedSlugs());
  } catch {
    return createPublicSitemapEntries([]);
  }
}

export function createPublicRobotsRules(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: ["/"],
      disallow: ["/admin", "/checkout", "/carrito", "/iniciar-sesion", "/recuperar-contrasena", "/restablecer-contrasena", "/auth/", "/playground/"],
    }],
    sitemap: [new URL("/sitemap.xml", officialOrigin).toString()],
  };
}

/** Gives clean numbered catalog pages a self-canonical; all query-defined views remain noindex. */
export function getCatalogMetadataPolicy(params: CatalogMetadataParams): Readonly<{ canonical: string; index: boolean }> {
  const keys = Object.keys(params).filter((key) => params[key] !== undefined);
  if (keys.length === 0) return { canonical: "/catalogo", index: true };

  const page = params.pagina;
  if (keys.length !== 1 || typeof page !== "string" || !/^[1-9]\d{0,4}$/.test(page)) {
    return { canonical: "/catalogo", index: false };
  }

  const numericPage = Number(page);
  if (!Number.isSafeInteger(numericPage) || numericPage > 10_000) return { canonical: "/catalogo", index: false };
  return numericPage === 1
    ? { canonical: "/catalogo", index: true }
    : { canonical: `/catalogo?pagina=${numericPage}`, index: true };
}
