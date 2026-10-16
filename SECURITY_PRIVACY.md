# REVA Security and Privacy Context

## Purpose and Authority

This document is the durable source of truth for REVA's current privacy/security posture, known gaps, feature-assessment rules, and evidence expectations. It records architecture and requirements; it does not replace migrations, RLS SQL, legal advice, or an approved implementation plan.

Read it before work involving security, privacy, Auth, users, uploads, Cart, chatbot, checkout, payments, analytics, or a new category of stored/processed data. Use `DATA_ARCH.md` for implemented schema/RLS/storage detail, `REVA_BUSINESS.md` for business/policy decisions, and `REVA_ROADMAP.md` for strategic sequencing.

## External Control-Plane Reporting Requirement

Every Sprint final report that requires developer interaction with Supabase, Render, GitHub, DNS, environment variables, billing, Auth, analytics, payment/chatbot providers, or another external control plane must include a **Developer Manual Actions** section. For every action, identify: its name; why REVA needs it; security/privacy/product effect; exact provider; expected UI path; current label; functional description; recommended state; nearby settings not to change; success check; how to proceed when the UI differs; likely equivalent labels; plan/billing requirement; and whether it is blocking, recommended, or optional. Identify a control by function and description when a provider UI changes; do not instruct unrelated nearby changes or claim an unverified setting is enabled.

## Current Security Baseline

- Supabase Auth provides identity and cookie-backed SSR sessions.
- Profile-backed roles govern customer/admin authorization; browser role state is never trusted.
- Business tables are default-deny. Public discovery uses fixed allowlisted published-Product projections rather than base-table access.
- RLS and guarded RPCs enforce ordinary request-scoped authorization. Security-definer functions use fixed search paths and explicit authorization checks where required.
- Private operational media and intentionally public delivery media are separate. Public product delivery is conditioned on completed publication/media readiness.
- M016 (`published_product_direct_mutation_guard`) protects the lifecycle rule that published Product facts, related ProductImage metadata, and related Intake information cannot be directly changed outside approved draft/lifecycle boundaries.
- Public origins derive from trusted server-only `REVA_SITE_URL`; normal request paths do not use a service-role key.

## Current Known Gaps

The following are recorded gaps, not completed remediations:

- The remaining `braces@3.0.3` audit advisory (GHSA-vfj7-8cjw-p6xm) is development/build-only through `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch`; the audit advertises `>=3.0.4`, but that package version was not available from the registry during Sprint 27. It is recorded for upstream follow-up, not treated as a production-runtime vulnerability.
- Supabase Free does not provide leaked-password prevention. This is a documented provider/plan limitation—not an application vulnerability or a mandatory upgrade—and must be reconsidered before higher-risk public Auth use or on a plan upgrade.
- Upload abuse/rate policy.
- Observability and incident runbook.
- Backup/recovery ownership.
- Historical S-01–S-06 definitions remain unrecovered; do not claim them fixed or redefine them without evidence.

## Sprint 27 Dependency Evidence (2026-10-04)

The local dependency tree was rebuilt from the approved frozen lockfile after a Windows/Codex sandbox file-access restriction affected its initial installation. `pnpm lint` and `pnpm build` pass with Next `16.3.8`; public routes, Product catalog/PDP reads, static images, anonymous admin protection, and the media Route Handler's unauthenticated `401` response were smoke-tested locally.

Disposable in-memory Sharp `0.35.5` fixtures verified JPEG, PNG, progressive JPEG, automatic orientation, 2560px maximum-edge resizing, WebP output, corrupt-input rejection, the 24 MP decoded-pixel boundary, and the 12 MiB application boundary. A benign EXIF fixture was absent from the resulting WebP. The tests used no Supabase, Storage, Product, or other remote mutation.

## Sprint 28 Web Security Baseline Evidence (2026-10-05)

Before this sprint, the live Render response had no CSP, HSTS, MIME-sniffing, referrer, permissions, framing, or `frame-ancestors` policy and exposed `X-Powered-By: Next.js`. All application responses now receive centrally configured browser-hardening headers:

| Control | Enforced value / decision |
| --- | --- |
| CSP | `default-src 'self'`; direct only to the configured Supabase origin for `connect-src` and `img-src`; no wildcard or `unsafe-eval`; frames and objects denied. |
| HSTS | `max-age=31536000`; no `includeSubDomains` or preload before REVA controls its final domain/subdomains. |
| MIME sniffing | `X-Content-Type-Options: nosniff`. |
| Referrer | `strict-origin-when-cross-origin`, preserving only REVA's origin when navigating to WhatsApp or Instagram. |
| Permissions | Camera, geolocation, microphone, payment, and USB disabled because REVA does not use them. |
| Framing | CSP `frame-ancestors 'none'` plus `X-Frame-Options: DENY`. |

`X-Powered-By` is disabled. The CSP allows only REVA itself and the configured Supabase origin for the required image/auth data boundary; WhatsApp and Instagram are ordinary navigational links and do not need CSP source allowances. The current Next.js runtime and rendered styling require the narrowly documented `unsafe-inline` allowances for scripts and styles. A nonce-based policy is deferred until a future change needs third-party script execution or removes that framework/runtime requirement.

Next.js Server Actions retain their framework same-origin validation with no additional `allowedOrigins` configured. The custom Product-media mutation route now independently requires an exact browser `Origin` match against server-only `REVA_SITE_URL` before its existing session, administrator, and draft-lifecycle authorization checks. It does not trust `Host` or forwarded-host request headers. Local validation confirmed that a wrong, malformed, or `null` Origin returns `403`; the trusted local Origin reaches the unchanged unauthenticated `401`; and a forged forwarded host cannot bypass the Origin check. Home, Catalog, PDP, optimized public Product images, and static assets loaded locally without CSP browser-console violations.

The Product-media route remains administrator-only, draft-only, limited to a 12 MiB JPEG/PNG source accepted by a 13 MB framework boundary, 24 MP decoded-pixel ceiling, guarded decoding, and WebP re-encoding. Its residual risk is repeated authorized 12 MiB/Sharp work on the single Render instance. No new application rate limiter was added: a process-local limiter would reset across deploys and offer little meaningful protection for this admin-only endpoint, while Redis/database/distributed control would add unapproved operational infrastructure. Reassess edge/provider control if real operator abuse appears; every future public chatbot, Cart, checkout, and payment boundary requires its own abuse/rate assessment.

The developer's authorized provider review confirmed Supabase Free / Basic Free. **Prevent use of leaked passwords** is unavailable at that plan and is not enabled; this is a documented residual provider/plan limitation, not a failed application implementation or a mandatory upgrade. The Email provider, Secure email change, and Secure password change are enabled. `Require current password when updating`, password minimum/requirements, OTP expiration/length, CAPTCHA, and other Auth rate limits remain unverified and require a future manual review before any change. The review observed two Auth users; no email address or other identifying data is retained in this repository documentation.

The developer also confirmed that Render auto-deployed Sprint 27 and that it is Live; no displayed SHA was recorded. Sprint 28 remains local and undeployed. The approved narrow `source-map-js: 1.2.2` override resolves every formerly affected route to `1.2.2`; the final audit retains only the known development/build-only `braces@3.0.3` advisory. `source-map-js` was reached through PostCSS/Tailwind build processing, is absent from the built Next server output, and required attacker-controlled indexed source-map input during build; it was nevertheless remediated because the supported patch is available.

Final local validation confirmed the required headers on Home, Catalog, a real PDP, Login, and the unauthenticated Product Manager redirect. It also reconfirmed trusted Origin → normal `401`, untrusted/malformed/`null` Origin → `403`, and forged Host/`X-Forwarded-Host` → `403`. `pnpm lint`, `pnpm build`, and local DB lint pass. No Product, ProductImage, Intake, Storage object, migration, RLS rule, remote configuration, deployment, commit, or push was mutated by this sprint.

### Sprint 28 Developer Manual Actions

#### 1. Verify plan and prevent leaked-password use

| Field | Current action guidance |
| --- | --- |
| Action name | Verify plan eligibility and enable **Prevent use of leaked passwords** only if available. |
| Why REVA needs it | It blocks known or easily guessed passwords on signup and password changes. |
| Security/privacy/product effect | Reduces credential-stuffing exposure without changing Product behavior or existing passwords. |
| Provider | Supabase Dashboard for the linked `reva-development` project. |
| Expected UI path | `Authentication → Attack Protection`; some current interfaces surface it at `Authentication → Providers → Email`. |
| Current UI label | **Prevent use of leaked passwords** — described as rejecting known or easy-to-guess passwords on sign up or password change. |
| What it does | Uses the Pwned Passwords/Have I Been Pwned corpus to reject exposed passwords. |
| Recommended value | Enable only after a future plan makes it available and the developer approves the provider change. |
| Do not change nearby | Do not change email provider, signup, SMTP, redirect URLs, CAPTCHA, or user/session settings as part of this action. |
| Verify success | Current verification is the Dashboard plan notice showing it unavailable on Free. After a future approved enablement, use only a disposable test flow. |
| If UI differs | Search Authentication settings for the function/description above. Report the visible wording and plan notice before changing an uncertain control. |
| Equivalent labels | `Leaked password protection`, `Prevent leaked passwords`, `Pwned Passwords`, or `Password security`. |
| Plan/billing | Confirmed unavailable on Supabase Free / Basic Free; Supabase documents it for Pro-and-above. Do not upgrade solely for this without explicit approval. |
| Priority | **DOCUMENTED RESIDUAL RISK**; reconsider before higher-risk public Auth usage or a plan upgrade. |

#### 2. Inspect adjacent Email Auth password controls without changing them

| Field | Current action guidance |
| --- | --- |
| Action name | Record the current Email Auth password/security settings for a follow-up approval. |
| Why REVA needs it | Establishes the actual Auth baseline without inventing password rules. |
| Security/privacy/product effect | Informs account protection; no Product/data behavior changes. |
| Provider | Supabase Dashboard, `Authentication → Providers → Email`, with related controls sometimes under `Authentication → Attack Protection`. |
| Labels to inspect | `Secure email change`, `Secure password change`, `Require current password when updating`, `Minimum password length`, `Password requirements`, `Email OTP expiration`, `Email OTP length`, and `CAPTCHA`. |
| What they do | They respectively protect address changes, password-change flows, reauthentication, password length/character policy, recovery/verification token lifetime/entropy, and automated abuse resistance. |
| Recommended state | The Email provider, Secure email change, and Secure password change are confirmed enabled. The remaining listed settings are unverified; record them before recommending any change. Do not impose composition rules, CAPTCHA, or OTP changes without a separate approved decision. |
| Do not change nearby | Do not change email confirmation, signup availability, provider credentials, redirect URLs, templates, or rate limits during inspection. |
| Verify success | Capture the labels and current states; no save/apply action is needed. |
| If UI differs | Match the security function, not the historical name, and report a screenshot/textual inventory before any change. |
| Equivalent labels | `Require current password`, `Password strength`, `Password policy`, `OTP expiry`, `Bot protection`, or `Turnstile/CAPTCHA`. |
| Plan/billing | Some advanced Supabase Auth controls may be plan-gated; record any displayed requirement rather than changing plans. |
| Priority | **RECOMMENDED** baseline evidence; any later change requires explicit approval. |

## Sprint 29 Privacy and Minimal Account Foundation (2026-10-07)

The public `/privacidad` route now describes only REVA's current data surface: Supabase Auth identity/email, cookie-backed sessions, minimal Profile/role data, a reversible marketing preference without a marketing system, private Intake operational records, published Product facts/public delivery media, and provider/runtime logs. It explicitly records the absence of Orders, payments, shipping addresses, persistent Cart data, chatbot transcripts, analytics profiles, advertising tracking, and non-essential tracking cookies. Essential session storage remains necessary for authenticated access.

The account lifecycle now has email/password signup, email confirmation, sign-in, sign-out, password-recovery request, and password update through the existing request-scoped SSR Auth boundary. A recovery request always displays the same outcome whether or not the email belongs to an account. The callback accepts only the provider's PKCE code or token-hash confirmation mechanism and routes recovery sessions to the reset page based on the verified JWT `amr` recovery method. The reset page and update action both require that verified recovery claim; ordinary password sessions cannot use the recovery endpoint. No browser-supplied Profile, role, or provider administration capability is accepted. Successful password changes clear the active recovery/session cookie and require a new sign-in.

REVA does not implement self-service account deletion. Deletion or anonymization cannot safely be automated while current-record retention, Intake ownership/history, auditability, administrator protections, and future commerce semantics remain unresolved. The approved privacy-request channels are the provisional public email and official REVA WhatsApp; identity and authority must be verified before information is disclosed or changed. No response-time or automatic-account-deletion promise is made. No extra profile field, database migration, RLS policy, Product mutation, or provider state change was introduced.

### Sprint 29 Developer Manual Actions

#### 3. Confirm the fixed password-recovery callback

| Field | Current action guidance |
| --- | --- |
| Action name | Record the developer-confirmed Site URL and fixed recovery callback configuration. |
| Why REVA needs it | Supabase must be permitted to return a password-recovery session to the application-controlled callback. |
| Security/privacy/product effect | Confirms the recovery redirect destination; enables the flow without exposing a session token to application JavaScript. It does not change Product, Intake, or role data. |
| Provider | Supabase Dashboard for the linked REVA project. |
| Expected UI path | `Authentication → URL Configuration`; current interfaces may group it under `Authentication → Configuration`. |
| Current UI label | `Redirect URLs` or `Additional Redirect URLs`. |
| What it does | Limits where Auth email links may send the browser after verification/recovery. |
| Recommended value | **Manually confirmed:** Site URL `https://reva-gt.onrender.com`; redirect allowlist includes `http://localhost:3000/auth/confirm` and `https://reva-gt.onrender.com/auth/confirm`; no wildcard entries were added. The application sends the exact callback path without query parameters. |
| Do not change nearby | Do not change Site URL, email provider, SMTP, email templates, signup confirmation, CAPTCHA, JWT settings, or user records as part of this action. |
| Verify success | Configuration is manually confirmed. The deployed end-to-end test remains pending until the application is deployed; use only a disposable authorized test account then. No production recovery email has been sent. |
| If UI differs | Search Auth settings for the redirect-destination allowlist and its description. Report visible labels before saving any uncertain setting. |
| Equivalent labels | `Allowed redirect URLs`, `Redirect allow list`, `Additional Redirect URLs`, or `URL Configuration`. |
| Plan/billing | No plan upgrade is expected for this normal Auth configuration. |
| Priority | **COMPLETED.** None required before Sprint 29 commit. An end-to-end production email test remains deferred until application deployment. |

The developer confirmed that no wildcard redirect was added and no unrelated Supabase Auth setting was changed. The application callback uses the exact allowlisted `/auth/confirm` path without query parameters. After exchanging the PKCE code or token hash server-side, it routes according to the verified recovery method in the JWT `amr` claim. The reset route and password-update action both require that recovery claim. Local smoke verified the callback's malformed-input failure path; no real recovery email was requested.

## Current Data Inventory

| Data category | Current purpose/boundary |
| --- | --- |
| Auth identity and email | Supabase Auth identity, verification, sessions, and Auth communications. |
| Profiles and roles | REVA business identity and customer/admin authorization. |
| Marketing preference | Reversible marketing-consent state; no marketing system is currently implemented. |
| Intake | Private operational record for received garments. |
| Products and ProductImages | REVA's controlled unique-product catalog records and image metadata. |
| Private media | Authoritative operational product media. |
| Public media | Intentional, published Product delivery copies only. |
| Recommendations | Internal curated Home merchandising relationship. |
| Cart selection | Up to 20 public Product slugs in versioned `localStorage`; no account or server Cart record. Current Product facts are fetched from the public projection when displayed and revalidated in Checkout before WhatsApp inquiry. |
| Checkout form review | Contact, delivery, and optional CF/NIT fields in transient browser memory only; never sent to REVA/server, placed in URLs, persisted, or included in WhatsApp. |
| Provider logs | Operational provider/runtime telemetry subject to provider configuration and access controls. |
| Environment configuration | Runtime settings and secrets held outside source control. |

Cart data exists only as local browser selection references. Checkout form values are processed only in browser memory to show the user's review and are not transmitted or retained by REVA. The server receives public Product slugs (and a public-price snapshot used only to detect a changed display) and returns the current public Product facts. A final user-initiated WhatsApp URL is constructed server-side from current public Product titles, prices, canonical URLs, and merchandise subtotal; personal contact/delivery/billing fields are not inputs to that builder. The user then leaves REVA for WhatsApp, whose own processing applies if they choose to send the message or add information. REVA still stores no server Cart record, Order data, Payment data, chatbot transcript data, address, billing identifier, or analytics data. This inventory must be updated before any future feature transmits or persists such data.

## Feature Privacy Rule

Before introducing a feature that creates a new category of stored or processed data, update this document with the data purpose, access boundary, retention/deletion implications, provider exposure, and required evidence. Examples include Cart persistence, chatbot transcripts, analytics identifiers, Orders, payment metadata, and shipping addresses.

## Chatbot Security Rule

The chatbot begins only with approved REVA business knowledge, curated FAQs, and optionally an allowlisted public Product projection. It has no raw database access, no write actions, and no admin/private tools. Any future tool or action requires a separate security review and explicit approval.

## Commerce Security Rule

Sprint 30's anonymous Cart stores only a versioned list of up to 20 public Product slugs in the browser's local storage under `reva-cart`. It stores no title, price, image URL, condition, quantity, email, profile/role, Intake, Product UUID, SKU, Auth information, Order, billing/NIT, shipping address, or payment data. Quantity is implicitly one. Data remains on that browser until items are removed, the Cart is cleared, or browser storage is reset; there is no automatic expiry, account synchronization, or server-side copy. Corrupt, obsolete-version, malformed, duplicate, or excessive references are safely discarded/normalized. No non-essential cookie, analytics, or third-party storage is introduced by Cart.

The Cart resolves its slugs against the allowlisted public Product preview projection when the Drawer is opened and `/carrito` is loaded. The public projection remains authoritative for current availability, title, size, condition, image, and price. Unavailable items are shown as unavailable, removable, and excluded from the merchandise subtotal and Checkout. `/checkout` accepts only bounded public slugs from PDP or Cart, resolves them through the normal request-scoped public projection, and blocks review-to-WhatsApp when any selected Product cannot be verified. The final WhatsApp step reads the projection again and stops for review if the public price changed. The subtotal is only the current merchandise subtotal, not shipping, taxes, fees, or a final amount due. The inquiry message contains only current public Product title, price, and canonical PDP URL, subtotal, and a note that delivery remains unconfirmed. Neither address/contact inputs nor NIT are sent in the server action or WhatsApp URL. Opening Checkout does not reserve a unique Product; it may become unavailable while selected, and the inquiry is not a reservation, Order, or payment confirmation.

Future transactional commerce work must:

- use the authoritative server/database Product price;
- guarantee that a unique Product cannot be sold twice;
- separate Order from Payment;
- verify payment server-side/provider-side;
- use idempotency;
- never trust browser payment success;
- never store PAN or CVV; and
- preserve evidence suitable for faculty review.

This is architectural direction, not approval to implement transactional commerce. The current non-transactional Checkout inquiry does not create Orders, reservations, payments, or invoices.

### Temporary request and transactional commerce direction — 2026-10-15 (business flow approved; security/schema and implementation not approved)

The approved future business lifecycle is `Temporary Purchase Request → Admin Approval → Confirmed Order → Payment Coordination → Verified Payment → Fulfillment`. This approves a commercial direction only, not schema, RLS/RPC, cryptographic design, guest-write capability, external provider setup, or implementation. The current data inventory remains unchanged: no customer contact, delivery, billing, Order, or Payment values are submitted to or stored by REVA. Do not activate collection before notices, safeguards, access controls, and retention/deletion rules are approved.

Each future temporary request must use a server-recorded creation timestamp and expire exactly 24 hours later (`expires_at = created_at + 24 hours`), individually rather than on a global daily cutoff; automatic extension is not approved. It does not reserve inventory, so multiple pending requests may reference the same unique Product. The server must reject admin approval after expiry even if a cleanup job is late. Expired/discarded requests and associated data must be deleted completely from operational stores, with no request-derived marketing metrics retained. Document infrastructure backup retention/recovery limitations and test deletion behavior before collection. Admin approval revalidates availability/current authoritative prices and atomically reserves the unique garments for three hours while creating/promoting an Order pending payment; it does not confirm payment. An authorized administrator manually verifies payment in Recurrente before marking the Order paid. None of these capabilities is currently implemented.

If approved, the new data categories would include customer contact values; delivery municipality/zone codes plus full address directions; conditional invoice recipient/identifier details; immutable Product/SKU/price snapshots; Order/request and reservation state; external provider payment references and verification events; policy-version evidence; and administrative access/fulfillment audit events. Define purpose, minimization, data owner, retention/deletion, backup lifetime, provider access, and privacy-request handling for each before migration. Do not store PAN/CVV or treat payment-link URLs, signed event material, or credentials as ordinary order fields.

The future secure purchase-request schema must keep customer `first_name` and `last_name` as separate fields. The trusted backend must independently validate and normalize each required value; UI validation is not an authorization or data-integrity boundary. Do not combine the fields into one persisted full-name value.

Proposed confidentiality boundary: keep all new business tables default-deny with no anonymous/customer raw-row read. Guest submission must use one narrowly bounded server operation; its exact credential/RPC boundary requires an ADR and must not turn a service-role client into a general repository or expose an unrestricted `SECURITY DEFINER` function to `anon`. Request submission validates and snapshots server-authoritative published Product facts and returns only a non-authorizing random reference; it creates no reservation. Admin approval must check `expires_at` against trusted server/database time, revalidate current availability/prices, and create/promote the pending-payment Order. The later Order/reservation operation must be atomic, enforce one active hold per unique Product, and use idempotency. Admin access must use the verified existing admin role and RLS; reveal/decrypt only the data needed for the action and audit the actor, object reference, purpose/action, and timestamp without plaintext.

For fields that must be retained in a readable operational form, evaluate maintained application-layer authenticated encryption (AES-256-GCM is a candidate) with secure nonce generation, authenticated record/field context, key versioning/rotation, server-only key custody separate from the database, recovery-tested backups, incident rotation, and audited minimal decryption. A managed KMS/envelope design is preferred if the selected runtime supports it; Render environment variables are not to be represented as KMS. Encryption does not protect plaintext in a compromised application process or authorized admin display. Keep keys, addresses, phone, NIT/CUI, full request bodies, payment credentials, and link tokens out of source control, URLs, client state, and logs; follow OWASP's authenticated-encryption, key-lifecycle, and logging guidance.

Before any data collection, implement and test a durable abuse-control design (bounded payloads, origin/CSRF controls, cross-instance rate limiting, proportionate bot mitigation, idempotent retries), request-expiry and complete deletion semantics, same-order unique-item transaction tests, trusted manual payment reconciliation in Recurrente, hold/cancellation/late-payment/recovery rules, a retention/deletion schedule, and non-production/production key restore drills. Expired/discarded request data must be deleted completely from operational stores without derived marketing metrics; document and test infrastructure-backup lifecycle limitations. Do not retain complete addresses/billing identifiers without a defined purpose. Confirmed Orders may retain only legally required commercial/fiscal records for a qualified, applicable period; do not invent a universal term. Terms acceptance, privacy-notice delivery/acknowledgement, and marketing consent are distinct: never treat required order processing as marketing consent. FEL identifiers/address fields remain conditional on qualified Guatemala tax review; the updated informational privacy notice and terms are not legal certification or authorization to collect data.

Before future transactional Checkout implementation, research and approve the Guatemala-specific operational/fiscal context. FEL, NIT, CF/Consumidor Final, invoice recipient information, invoice-provider integration, and payment-confirmation/invoice sequencing are candidate questions to verify, not legal requirements asserted here. The current Checkout's optional NIT/recipient fields are only in-memory illustrative review fields: no validation, storage, submission, or invoice generation occurs. An atomic unique-Product reservation/concurrency boundary must precede payment; payment provider, refunds, delivery, and Order policies remain future decisions.

The 2026-10-14 official non-transactional Checkout introduces transient browser-memory fields but no current server data category or persistence: REVA still does not receive/store customer addresses, billing identifiers, Orders, payment records, or geographic sales analytics. The 2.5D map is deferred; municipality/zone text controls are not serviceability claims. Before any approved transmission or collection, update this inventory and define purpose, minimization, validation, guest/owner authorization, RLS, retention/deletion, logs/URL/analytics exclusions, provider exposure, and privacy-request handling. Consult `REVA_ROADMAP.md` and `TO_CONSIDER.md` for map and transactional boundaries; no schema or migration is approved.

### Public policy alignment — 2026-10-15

The updated local `/privacidad` notice distinguishes current processing from future request/Order data, and describes planned server validation, least-privilege access/RLS, appropriate authenticated encryption with server-only keys, restricted/audited administrative access, no card-data storage, complete request-data deletion, and justified retention as **future safeguards**, not implemented controls. The Checkout still sends no name, phone, delivery address, municipality/zone or billing identifier to REVA and stores none of them. The approved buyer terms, privacy request channels/identity check, provider boundaries, and retention principles are policy decisions; they add no current data collection or database schema. Before real customer-data collection, operationalize the approved purposes, safeguards, backup/deletion controls, provider disclosures, and applicable legal advice; do not treat the informational pages as legal certification.

### Sprint 30 Security/Privacy Assessment (2026-10-07)

Cart is an anonymous, browser-local convenience layer and does not require weakening CSP, Origin checks, Auth, RLS, RPC, Storage, or M016. A server action accepts only a bounded list of syntactically valid public slugs and reads only the existing allowlisted `api.published_product_previews` projection with the ordinary request-scoped publishable Supabase client. No service-role credential, base-table query, migration, new grant, privileged provider client, external control-plane change, or product mutation was introduced. Public/Product information is rendered as text and its image uses the existing public delivery URL boundary. Residual behavior is intentional: a local reference is not ownership or reservation, browser localStorage can be altered by its user, and current public inventory may change at any time.

### Official Checkout Security/Privacy Assessment (2026-10-14)

The anonymous Cart and non-transactional Checkout do not require weakening CSP, Origin checks, Auth, RLS, RPC, Storage, or M016. Checkout server actions accept only bounded valid public slugs and a public-price snapshot for changed-price comparison; they read only the existing allowlisted `api.published_product_previews` projection with the ordinary request-scoped publishable Supabase client. The action constructing the WhatsApp inquiry receives no form/contact/address/billing values. No service-role credential, base-table query, migration, new grant, privileged provider client, external control-plane change, or Product mutation was introduced. Public Product information is rendered as text and images use the existing public delivery URL boundary. Residual behavior is intentional: a local Cart reference is not ownership or reservation, the browser can be manipulated by its user, availability can change after the final read, and opening WhatsApp does not prove message delivery.

## Faculty Review Evidence

The final independent Systems Engineering faculty review must be able to inspect appropriate evidence, including:

- system version/commit and production URL;
- architecture and data flows;
- data inventory and authorization matrix;
- RLS/RPC summary and upload-security evidence;
- security-header and dependency-audit evidence;
- privacy notice, retention/deletion process, and Auth settings;
- incident/recovery plan;
- safe test accounts and disposable fixtures;
- reviewer findings and remediation evidence.

The independent reviewer determines whether the evidence is sufficient. A signed review letter with their contact information is required for the final group report; this document does not assert that approval has already been granted.

## Evidence and Update Discipline

Security/privacy changes require proportionate validation and documentation of both intended protections and residual risk. Update this document when a gap is remediated, a new data category appears, a provider changes, or a faculty-review artifact is created. Keep implementation history in `SPRINTS.md` and technical architecture in `DATA_ARCH.md` rather than duplicating them here.

## Approved Privacy and Temporary-Request Policy — 2026-10-15

The approved provisional privacy-request channels are the public email `cam22155@uvg.edu.gt` and configured official REVA WhatsApp. Requests may concern access, correction, deletion, or privacy questions. Verify the requester's identity and authority before disclosure or modification; no fixed response time or automatic account-deletion promise is made. The public email is expected to change after REVA establishes its own domain. REVA does not sell personal information or share it for independent third-party marketing. Necessary providers may process minimum data for legitimate operational purposes with appropriate safeguards and transparent disclosure. Marketing authorization must be optional and separate from purchase.

The current Checkout remains non-transactional; its form values are not submitted or stored. For a future temporary purchase-request feature, each request expires 24 hours after server-recorded creation, never reserves inventory or extends automatically, and cannot be approved after expiry. Expired/discarded request data must be deleted completely from operational stores with no request-derived marketing metrics. Document backup-retention/recovery limitations and deletion evidence before activating collection; do not imply that deleting an operational record immediately purges immutable backup generations. At admin approval, the future Order transition and three-hour unique-Product reservation must be atomic. An authorized administrator manually verifies payment in Recurrente before an Order is marked paid. None of these transactional controls is currently implemented. Exact legally applicable retention periods for confirmed commercial/fiscal records require qualified advice; do not promise indefinite retention.
