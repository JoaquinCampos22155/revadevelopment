import "server-only";

const developmentSiteUrl = "http://localhost:3000";

function invalidSiteUrl(): never {
  throw new Error("REVA_SITE_URL must be an absolute public origin without credentials, a path, a query, or a fragment.");
}

/**
 * Resolves the single trusted public origin used for canonical metadata and
 * customer-facing absolute links. Incoming request headers never define it.
 */
export function getRevaSiteUrl(): URL {
  const configuredUrl = process.env.REVA_SITE_URL?.trim()
    ?? (process.env.NODE_ENV === "development" ? developmentSiteUrl : null);

  if (!configuredUrl) {
    throw new Error("Missing required environment variable: REVA_SITE_URL.");
  }

  let siteUrl: URL;

  try {
    siteUrl = new URL(configuredUrl);
  } catch {
    return invalidSiteUrl();
  }

  const isDevelopmentUrl = siteUrl.href === `${developmentSiteUrl}/`;
  const isHttps = siteUrl.protocol === "https:";

  if (
    (!isHttps && !isDevelopmentUrl)
    || siteUrl.username
    || siteUrl.password
    || siteUrl.pathname !== "/"
    || siteUrl.search
    || siteUrl.hash
  ) {
    return invalidSiteUrl();
  }

  return new URL(siteUrl.origin);
}

/**
 * Validates a browser mutation Origin against the configured public REVA
 * origin. Incoming Host and forwarded-host headers never establish trust.
 */
export function isTrustedRevaOrigin(origin: string | null): boolean {
  if (!origin || origin === "null") return false;

  try {
    const candidate = new URL(origin);
    return candidate.origin === origin && candidate.origin === getRevaSiteUrl().origin;
  } catch {
    return false;
  }
}

/** Builds a Product URL from the trusted public origin and safe route input. */
export function getPublicProductUrl(slug: string): string {
  return new URL(`/productos/${encodeURIComponent(slug)}`, getRevaSiteUrl()).toString();
}
