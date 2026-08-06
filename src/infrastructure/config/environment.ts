type SupabaseEnvironment = Readonly<{
  publishableKey: string;
  url: string;
}>;

type RequiredSupabaseEnvironmentVariable =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

function readRequiredEnvironmentVariable(
  variableName: RequiredSupabaseEnvironmentVariable,
): string {
  const value = process.env[variableName];

  if (!value) {
    throw new Error(`Missing required environment variable: ${variableName}.`);
  }

  return value;
}

/**
 * Centralizes provider configuration so infrastructure clients do not read
 * environment variables throughout the application.
 */
export function getSupabaseEnvironment(): SupabaseEnvironment {
  return {
    url: readRequiredEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: readRequiredEnvironmentVariable(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ),
  };
}
