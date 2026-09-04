import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl) : undefined;
const supabaseProtocol = supabaseOrigin?.protocol === "http:" ? "http" : "https";

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
};

export default nextConfig;
