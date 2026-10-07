"use server";

import { redirect } from "next/navigation";

import { getRevaSiteUrl } from "@/infrastructure/config/site";
import { createSupabaseServerActionClient } from "@/infrastructure/supabase/server-action-client";
import { hasPasswordRecoveryClaim } from "@/features/auth/server/recovery-session";

const loginPath = "/iniciar-sesion";
const passwordRecoveryPath = "/recuperar-contrasena";
const passwordResetPath = "/restablecer-contrasena";

function readCredentials(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || password.length < 8) {
    return null;
  }

  return { email: normalizedEmail, password };
}

function readEmail(formData: FormData): string | null {
  const email = formData.get("email");

  if (typeof email !== "string") return null;

  const normalizedEmail = email.trim().toLowerCase();
  return normalizedEmail || null;
}

function readNewPassword(formData: FormData): string | null {
  const password = formData.get("password");
  const passwordConfirmation = formData.get("passwordConfirmation");

  if (
    typeof password !== "string"
    || typeof passwordConfirmation !== "string"
    || password.length < 8
    || password !== passwordConfirmation
  ) {
    return null;
  }

  return password;
}

/**
 * Starts a password session through the writable server-side Auth boundary.
 * Credential failures deliberately remain generic to avoid exposing Auth detail.
 */
export async function signInWithEmail(formData: FormData) {
  const credentials = readCredentials(formData);

  if (!credentials) {
    redirect(`${loginPath}?error=credenciales`);
  }

  const supabase = await createSupabaseServerActionClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    redirect(`${loginPath}?error=credenciales`);
  }

  redirect("/catalogo");
}

/**
 * Creates a password account without accepting role or Profile data from the
 * browser. Migration 003 provisions the default-customer Profile atomically.
 */
export async function signUpWithEmail(formData: FormData) {
  const credentials = readCredentials(formData);

  if (!credentials) {
    redirect(`${loginPath}?error=registro`);
  }

  const supabase = await createSupabaseServerActionClient();
  const { error } = await supabase.auth.signUp(credentials);

  if (error) {
    redirect(`${loginPath}?error=registro`);
  }

  redirect(`${loginPath}?estado=confirma-correo`);
}

/** Sends the same confirmation message whether or not an account uses the email. */
export async function requestPasswordReset(formData: FormData) {
  const email = readEmail(formData);

  if (email) {
    const supabase = await createSupabaseServerActionClient();
    const redirectTo = new URL("/auth/confirm", getRevaSiteUrl()).toString();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  }

  redirect(`${passwordRecoveryPath}?estado=solicitud-enviada`);
}

/** Changes a password only for the verified recovery or active authenticated session. */
export async function updatePassword(formData: FormData) {
  const password = readNewPassword(formData);

  if (!password) {
    redirect(`${passwordResetPath}?error=contrasena`);
  }

  const supabase = await createSupabaseServerActionClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (
    claimsError
    || typeof data?.claims.sub !== "string"
    || !hasPasswordRecoveryClaim(data.claims)
  ) {
    redirect(`${loginPath}?error=restablecimiento`);
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`${loginPath}?error=restablecimiento`);
  }

  await supabase.auth.signOut();
  redirect(`${loginPath}?estado=contrasena-actualizada`);
}

/** Clears the request's Auth session through the writable server boundary. */
export async function signOut() {
  const supabase = await createSupabaseServerActionClient();
  await supabase.auth.signOut();

  redirect("/");
}
