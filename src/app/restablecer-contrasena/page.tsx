import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { updatePassword } from "@/features/auth/server/auth.actions";
import { hasPasswordRecoveryClaim } from "@/features/auth/server/recovery-session";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

export const metadata: Metadata = {
  title: "Restablecer contraseña | REVA",
  description: "Actualiza la contraseña de tu cuenta REVA.",
  robots: { follow: false, index: false },
};

type PasswordResetPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

/** Limits password changes to a session Supabase has already verified. */
export default async function PasswordResetPage({ searchParams }: PasswordResetPageProps) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (
    error
    || typeof data?.claims.sub !== "string"
    || !hasPasswordRecoveryClaim(data.claims)
  ) {
    redirect("/iniciar-sesion?error=restablecimiento");
  }

  const params = await searchParams;
  const hasInvalidPassword = params.error === "contrasena";

  return (
    <main id="main-content">
      <Section>
        <div className="mx-auto max-w-md space-y-8">
          <div className="space-y-4 text-center">
            <Text variant="label">Tu cuenta REVA</Text>
            <Heading level={1} variant="editorial">Crea una nueva contraseña.</Heading>
            <Text className="text-lg" variant="body">Usa al menos ocho caracteres. Al terminar, te pediremos iniciar sesión nuevamente.</Text>
          </div>

          {hasInvalidPassword ? <p aria-live="polite" className="rounded-xl border border-reva-border bg-reva-muted px-4 py-3 text-sm leading-6 text-reva-primary">Revisa que ambas contraseñas coincidan y tengan al menos ocho caracteres.</p> : null}

          <form action={updatePassword} className="space-y-5 rounded-xl border border-reva-border bg-reva-surface p-6 shadow-sm sm:p-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-reva-primary" htmlFor="password">Nueva contraseña</label>
              <input autoComplete="new-password" className="min-h-11 w-full rounded-lg border border-reva-border bg-reva-surface px-3 text-reva-primary outline-none transition focus:border-reva-brand-strong focus:ring-2 focus:ring-reva-focus/25" id="password" minLength={8} name="password" required type="password" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-reva-primary" htmlFor="passwordConfirmation">Confirma la nueva contraseña</label>
              <input autoComplete="new-password" className="min-h-11 w-full rounded-lg border border-reva-border bg-reva-surface px-3 text-reva-primary outline-none transition focus:border-reva-brand-strong focus:ring-2 focus:ring-reva-focus/25" id="passwordConfirmation" minLength={8} name="passwordConfirmation" required type="password" />
            </div>
            <Button className="w-full" type="submit" variant="solid">Actualizar contraseña</Button>
          </form>
        </div>
      </Section>
    </main>
  );
}
