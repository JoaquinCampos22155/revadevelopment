import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import {
  signInWithEmail,
  signUpWithEmail,
} from "@/features/auth/server/auth.actions";
import { getCurrentUserProfile } from "@/features/users/server/current-user.service";

export const metadata: Metadata = {
  title: "Tu cuenta | REVA",
  description: "Inicia sesión o crea tu cuenta REVA.",
  robots: { follow: false, index: false },
};

type LoginPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function getNotice(searchParams: Record<string, string | string[] | undefined>) {
  if (searchParams.estado === "confirma-correo") {
    return "Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.";
  }

  if (searchParams.error === "confirmacion") {
    return "No fue posible confirmar el correo. Solicita un nuevo registro o intenta iniciar sesión.";
  }

  if (searchParams.error === "credenciales") {
    return "Revisa tu correo y contraseña e intenta nuevamente.";
  }

  if (searchParams.error === "registro") {
    return "No fue posible crear tu cuenta. Revisa los datos e intenta nuevamente.";
  }

  return null;
}

/** Provides the intentional email-and-password entry point for REVA accounts. */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const currentProfile = await getCurrentUserProfile();

  if (currentProfile) {
    redirect("/catalogo");
  }

  const notice = getNotice(await searchParams);

  return (
    <main id="main-content">
      <Section>
        <div className="mx-auto max-w-md space-y-8">
          <div className="space-y-4 text-center">
            <Text variant="label">Tu cuenta REVA</Text>
            <Heading level={1} variant="editorial">Descubre REVA a tu manera.</Heading>
            <Text className="text-lg" variant="body">
              Inicia sesión para continuar explorando y acompañar el crecimiento de la comunidad REVA.
            </Text>
          </div>

          {notice ? (
            <p aria-live="polite" className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm leading-6 text-slate-800">
              {notice}
            </p>
          ) : null}

          <form action={signInWithEmail} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-950" htmlFor="email">Correo electrónico</label>
              <input autoComplete="email" className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" id="email" name="email" required type="email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-950" htmlFor="password">Contraseña</label>
              <input autoComplete="current-password" className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" id="password" minLength={8} name="password" required type="password" />
            </div>
            <Button className="w-full" type="submit" variant="solid">Iniciar sesión</Button>
          </form>

          <details className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <summary className="cursor-pointer text-sm font-medium text-slate-950">¿Aún no tienes cuenta?</summary>
            <form action={signUpWithEmail} className="mt-5 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-950" htmlFor="signup-email">Correo electrónico</label>
                <input autoComplete="email" className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" id="signup-email" name="email" required type="email" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-950" htmlFor="signup-password">Crea una contraseña</label>
                <input autoComplete="new-password" className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" id="signup-password" minLength={8} name="password" required type="password" />
              </div>
              <Button className="w-full" type="submit" variant="outline">Crear cuenta</Button>
            </form>
          </details>

          <div className="text-center">
            <Button href="/catalogo" variant="outline">Seguir explorando</Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
