export const CHECKOUT_ACTION_DATA_MAX_BYTES = 32 * 1024;
export const CHECKOUT_SERVER_ACTION_BODY_MAX_BYTES = 64 * 1024;

type CheckoutActionPayload = Readonly<{
  details: unknown;
  expected: unknown;
  idempotencyKey: unknown;
  slugs: unknown;
}>;

/** Bounds only the transaction-specific data, including UTF-8 expansion. */
export function isCheckoutActionPayloadWithinLimit(payload: CheckoutActionPayload): boolean {
  try {
    const serialized = JSON.stringify(payload);
    return serialized !== undefined && new TextEncoder().encode(serialized).byteLength <= CHECKOUT_ACTION_DATA_MAX_BYTES;
  } catch {
    return false;
  }
}

type CheckoutActionRequestMetadata = Readonly<{
  contentLength: string | null;
  hasActionId: boolean;
  method: string;
  pathname: string;
}>;

/** Rejects oversized, identified Server Actions on Checkout before action parsing. */
export function shouldRejectOversizedCheckoutAction(request: CheckoutActionRequestMetadata): boolean {
  if (request.method.toUpperCase() !== "POST" || !/^\/checkout\/?$/.test(request.pathname) || !request.hasActionId) return false;
  if (request.contentLength === null) return false;
  if (!/^\d+$/.test(request.contentLength)) return true;
  const length = Number(request.contentLength);
  return !Number.isSafeInteger(length) || length > CHECKOUT_SERVER_ACTION_BODY_MAX_BYTES;
}
