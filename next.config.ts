import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl) : undefined;
const supabaseProtocol = supabaseOrigin?.protocol === "http:" ? "http" : "https";
const supabaseSource = supabaseOrigin?.origin;

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `connect-src 'self'${supabaseSource ? ` ${supabaseSource}` : ""}`,
  `img-src 'self'${supabaseSource ? ` ${supabaseSource}` : ""}`,
  "font-src 'self'",
  "frame-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(), payment=(), usb=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  // Preserve REVA's constitution as the sole owner of AGENTS.md.
  agentRules: false,
  experimental: {
    // A 12 MiB source file plus multipart framing fits below 13 MB, while the
    // application policy remains the authoritative accepted-file ceiling.
    proxyClientMaxBodySize: "13mb",
    serverActions: {
      // Proxy and Route Handler requests share this framework body boundary.
      // Keep it above the approved source-file policy without changing that policy.
      bodySizeLimit: "13mb",
    },
  },
  images: supabaseOrigin ? {
    remotePatterns: [{ hostname: supabaseOrigin.hostname, pathname: "/storage/v1/object/public/public-product-media/**", port: supabaseOrigin.port, protocol: supabaseProtocol, search: "" }],
  } : undefined,
  poweredByHeader: false,
  async headers() {
    return [{
      headers: securityHeaders,
      source: "/:path*",
    }];
  },
};

export default nextConfig;
