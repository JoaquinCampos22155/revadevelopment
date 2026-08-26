import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  experimental: {
    // A 12 MiB source file plus multipart framing fits below 13 MB, while the
    // application policy remains the authoritative accepted-file ceiling.
    proxyClientMaxBodySize: "13mb",
  },
  images: supabaseHostname ? {
    remotePatterns: [{ hostname: supabaseHostname, pathname: "/storage/v1/object/public/public-product-media/**", port: "", protocol: "https", search: "" }],
  } : undefined,
};

export default nextConfig;
