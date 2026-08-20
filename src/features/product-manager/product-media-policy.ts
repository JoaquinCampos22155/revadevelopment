/**
 * Keeps operator-facing media limits and Sharp output settings coherent while
 * allowing future evidence to change one reviewed operational policy.
 */
export const productMediaPolicy = {
  maximumDecodedPixels: 24_000_000,
  maximumLongEdge: 2560,
  maximumSourceBytes: 12 * 1024 * 1024,
  webpQuality: 82,
} as const;
