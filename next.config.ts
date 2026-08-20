import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // A 12 MiB source file plus multipart framing fits below 13 MB, while the
    // application policy remains the authoritative accepted-file ceiling.
    proxyClientMaxBodySize: "13mb",
  },
};

export default nextConfig;
