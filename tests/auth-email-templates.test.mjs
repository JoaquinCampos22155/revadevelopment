import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const templateDirectory = new URL("../docs/auth-email-templates/", import.meta.url);
const recovery = await readFile(new URL("password-recovery.html", templateDirectory), "utf8");
const confirmation = await readFile(new URL("email-confirmation.html", templateDirectory), "utf8");
const localConfig = await readFile(new URL("../supabase/config.toml", import.meta.url), "utf8");

function assertEmailSafeMarkup(markup) {
  assert.match(markup, /<!doctype html>/i);
  assert.match(markup, /<html lang="es">/i);
  assert.match(markup, /<table role="presentation"/i);
  assert.doesNotMatch(markup, /<script\b|<iframe\b|<img\b|<link\b|tracking[-_ ]?pixel/i);
  assert.doesNotMatch(markup, /https?:\/\//i);
  assert.match(markup, /font-family:Arial, Helvetica, sans-serif/);
}

test("password recovery template preserves Supabase confirmation URL behavior", () => {
  assert.match(recovery, /Subject: REVA \| Restablece tu contraseña/);
  assert.match(recovery, /href="\{\{ \.ConfirmationURL \}\}"/);
  assert.equal((recovery.match(/\.ConfirmationURL/g) ?? []).length, 2);
  assert.doesNotMatch(recovery, /\.TokenHash|\.Token\s*\}\}/);
  assertEmailSafeMarkup(recovery);
});

test("signup confirmation template uses the existing token-hash server callback", () => {
  assert.match(confirmation, /Subject: REVA \| Confirma tu correo electrónico/);
  assert.match(confirmation, /href="\{\{ \.SiteURL \}\}\/auth\/confirm\?token_hash=\{\{ \.TokenHash \}\}&amp;type=email"/);
  assert.doesNotMatch(confirmation, /\.ConfirmationURL|\.Token\s*\}\}/);
  assertEmailSafeMarkup(confirmation);
});

test("local Supabase callback allowlist is exact, local-only, and retains its existing callback", () => {
  assert.match(localConfig, /site_url = "http:\/\/127\.0\.0\.1:3000"/);
  assert.match(localConfig, /additional_redirect_urls = \["https:\/\/127\.0\.0\.1:3000", "http:\/\/localhost:3000\/auth\/confirm"\]/);
  assert.doesNotMatch(localConfig, /additional_redirect_urls\s*=\s*\[[^\]]*\*/);
});
