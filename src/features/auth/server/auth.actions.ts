"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerActionClient } from "@/infrastructure/supabase/server-action-client";

const loginPath = "/iniciar-sesion";

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

/** Clears the request's Auth session through the writable server boundary. */
export async function signOut() {
  const supabase = await createSupabaseServerActionClient();
  await supabase.auth.signOut();

  redirect("/");
}
