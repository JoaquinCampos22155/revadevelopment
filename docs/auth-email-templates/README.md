# REVA authentication email templates

These are review-ready Spanish HTML bodies for the hosted Supabase **Reset Password** and **Confirm signup** templates. They are not applied automatically and do not change local or hosted Auth configuration.

Supabase's current [Email Templates documentation](https://supabase.com/docs/guides/auth/auth-email-templates) defines the supported template variables and distinguishes hosted Dashboard templates from local CLI template configuration.

The logo is a text-only `REVA` wordmark, matching the text treatment in the site's existing `BrandLogo`. The repository has an SVG icon, but no stable public HTTPS PNG wordmark URL; the templates therefore load no external images, stylesheets, fonts, scripts, or tracking resources.

## Install manually in hosted Supabase

1. Keep the current template contents available for rollback.
2. In the correct hosted REVA project, open **Authentication → Email Templates** (the Dashboard may show this as the Email Templates page under Authentication).
3. Open **Reset Password**. Set the subject to `REVA | Restablece tu contraseña`, then copy only the body from `password-recovery.html` into the HTML content editor. Preserve `{{ .ConfirmationURL }}` exactly. Do not change URL Configuration, SMTP, tracking, or other templates while doing this.
4. Open **Confirm signup**. Set the subject to `REVA | Confirma tu correo electrónico`, then copy only the body from `email-confirmation.html`. Preserve `{{ .SiteURL }}`, `{{ .TokenHash }}`, `type=email`, and the `/auth/confirm` route exactly. Do not replace this with an OTP, `.ConfirmationURL`, or a client-side token flow.
5. Use the Dashboard's preview facility to inspect both subjects and the rendered bodies. Do not send a real email as part of this change. If a rendered-variable or end-to-end test requires sending a message, stop and obtain separate approval for a controlled test inbox first. Make no other Auth configuration changes.
6. If either link or rendered variable is wrong, restore that template's saved prior subject/body and verify the previous flow before trying again.

The recovery action currently supplies the `/auth/confirm` `redirectTo` in application code. The confirmation template constructs the token-hash callback already handled by `src/app/auth/confirm/route.ts`. The configured hosted Site URL and redirect allowlist are outside this template change and must remain as currently approved.

Hosted Supabase templates are changed in the Dashboard. Local Supabase templates are a separate configuration mechanism (`supabase/config.toml` and configured local HTML paths); these hosted review files are not wired into local Auth delivery.
