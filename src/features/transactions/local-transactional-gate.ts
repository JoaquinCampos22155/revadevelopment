type LocalTransactionalEnvironment = Readonly<{
  NODE_ENV?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  REVA_LOCAL_TRANSACTIONAL_ENABLED?: string;
}>;

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function isLoopbackSupabaseUrl(value: string | undefined): boolean {
  try {
    const hostname = new URL(value ?? "").hostname.replace(/^\[|\]$/g, "");
    return LOOPBACK_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

/** Keeps the local-only transaction feature disabled outside explicit loopback development. */
export function isLocalTransactionalRequestsEnabled(environment: LocalTransactionalEnvironment): boolean {
  if (environment.NODE_ENV !== "development" || environment.REVA_LOCAL_TRANSACTIONAL_ENABLED !== "true") return false;
  return isLoopbackSupabaseUrl(environment.NEXT_PUBLIC_SUPABASE_URL);
}
