import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { requestPasswordReset } from "@/features/auth/server/auth.actions";

export const metadata: Metadata = {
  title: "Recuperar contraseña | REVA",
  description: "Solicita un enlace para recuperar tu contraseña REVA.",
  robots: { follow: false, index: false },
};

type PasswordRecoveryPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

/** Starts an enumeration-safe password-recovery request without collecting profile data. */
export default async function PasswordRecoveryPage({ searchParams }: PasswordRecoveryPageProps) {
  const params = await searchParams;
  const hasRequestedReset = params.estado === "solicitud-enviada";

  return (
    <main id="main-content">
      <Section>
        <div className="mx-auto max-w-md space-y-8">
          <div className="space-y-4 text-center">
            <Text variant="label">Tu cuenta REVA</Text>
            <Heading level={1} variant="editorial">Recupera tu contraseña.</Heading>
            <Text className="text-lg" variant="body">Escribe el correo que usas para iniciar sesión y te enviaremos un enlace para continuar.</Text>
          </div>

          {hasRequestedReset ? (
            <p aria-live="polite" className="rounded-xl border border-reva-border bg-reva-muted px-4 py-3 text-sm leading-6 text-reva-primary">
              Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña.
            </p>
          ) : (
            <form action={requestPasswordReset} className="space-y-5 rounded-xl border border-reva-border bg-reva-surface p-6 shadow-sm sm:p-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-reva-primary" htmlFor="email">Correo electrónico</label>
                <input autoComplete="email" className="min-h-11 w-full rounded-lg border border-reva-border bg-reva-surface px-3 text-reva-primary outline-none transition focus:border-reva-brand-strong focus:ring-2 focus:ring-reva-focus/25" id="email" name="email" required type="email" />
              </div>
              <Button className="w-full" type="submit" variant="solid">Enviar enlace</Button>
            </form>
          )}

          <div className="text-center"><Button href="/iniciar-sesion" variant="outline">Volver a iniciar sesión</Button></div>
        </div>
      </Section>
    </main>
  );
}
