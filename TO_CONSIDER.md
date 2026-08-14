# REVA Deferred Decisions and Accepted Temporary States

## Purpose

This document records decisions deliberately postponed by approved REVA architecture or implementation work. It is not a generic feature backlog. Each entry identifies the deferred boundary, why it is not being implemented now, and the event that should reopen it.

For durable engineering law, use `AGENTS.md`. For the approved data model and security architecture, use `DATA_ARCH.md`. For completed work and the next milestone, use `SPRINTS.md`.

## Pre-launch Requirements

### Production domain, URLs, and SEO operations

- **State:** No final production domain has been selected.
- **Why deferred:** Development uses localhost and must not invent production URLs.
- **Reconsider:** Before the first production deployment.
- **Trigger:** A production domain and hosting plan are approved.
- **Required decision:** `metadataBase`, canonical URLs, sitemap, robots policy, Auth Site URL and redirects, image-domain strategy, and Search Console ownership.
- **Category:** Pre-launch requirement.

### Production transactional email identity

- **State:** Hosted development Auth uses Supabase Custom SMTP with Mailtrap Email Sandbox.
- **Why deferred:** Mailtrap Sandbox is development-only and is not a deliverability or production-identity solution.
- **Reconsider:** Before inviting real users or deploying public Auth.
- **Trigger:** A production domain is approved.
- **Required decision:** Transactional-email provider, sender name and address, domain verification, SPF, DKIM, DMARC, rate limits, production templates, recovery emails, and the retirement of development SMTP.
- **Category:** Pre-launch requirement / infrastructure evolution.

### Deployment, backups, and operational recovery

- **State:** The project is operating as a development system; Supabase Free is sufficient for current development.
- **Why deferred:** Backup, recovery, monitoring, and paid-plan decisions require an approved production operating model.
- **Reconsider:** Before production launch.
- **Trigger:** Production traffic, business data, or availability expectations are approved.
- **Required decision:** Hosting/deployment configuration, Supabase plan, backup and recovery targets, inactivity risk, incident ownership, and operational monitoring.
- **Category:** Pre-launch requirement / infrastructure evolution.

## Security Hardening

### Leaked-password protection

- **State:** The Supabase Security Advisor reports leaked-password protection as disabled.
- **Why deferred:** It is a hosted Auth configuration decision, not a schema or UI correction.
- **Reconsider:** During production Auth hardening.
- **Trigger:** Before public Auth launch or when password policy is formally approved.
- **Required decision:** Enablement and the accompanying user-support/password-reset experience.
- **Category:** Security hardening / pre-launch requirement.

### Definer-owned public Product projections

- **State:** `api.published_product_previews` and `api.published_product_details` intentionally read through their migration owner so anonymous base-table access can remain denied. Supabase's Security Advisor reports the generic `security_definer_view` warning.
- **Why deferred:** The views currently have fixed allowlists, a `published` predicate, explicit grants, and no Product data. The warning needs a production-specific security review, not a superficial suppression.
- **Reconsider:** Before public production catalog data is exposed.
- **Trigger:** Sprint 20 creates a real development Product, or before production launch.
- **Required decision:** Explicitly accept and document the reviewed exception, harden the current design, or replace it with a demonstrably safer equivalent that still protects base tables and preserves SEO.
- **Category:** Security hardening / pre-launch requirement.

### Account deletion and retained history

- **State:** No account-deletion feature exists. Profile/Auth relationships protect Intake attribution, Product audit history, and consent records.
- **Why deferred:** Deletion requires a privacy, retention, audit, and legal design; deleting a Profile casually would damage business traceability.
- **Reconsider:** Before exposing account-management features.
- **Trigger:** A legal/privacy requirement or an approved account-settings feature.
- **Required decision:** Deletion, anonymization, retention, and Admin/Intake historical consequences.
- **Category:** Security and privacy evolution.

## Near-term Backend and Catalog Evolution

### Storage and image delivery

- **State:** Storage buckets, upload flows, image delivery, and deletion workflows are not implemented. `ProductImage.storage_key` remains provider-neutral and internal.
- **Why deferred:** Public image URLs must not be invented or derived from raw storage keys.
- **Reconsider:** Before the catalog needs real Product imagery.
- **Trigger:** A real Product Image workflow is approved.
- **Required decision:** Bucket ownership/access, upload validation, ImageService delivery contract, stable URLs, responsive WebP/AVIF strategy, metadata, SEO discovery, and coordinated database/object deletion.
- **Category:** Near-term backend milestone.

### Product Manager and official Product operations

- **State:** No Product Manager, Product write repository, or Product creation UI exists.
- **Why deferred:** Sprint 19 proves only safe public reads. Product writes need an approved admin workflow and business validation.
- **Reconsider:** After Sprint 20's real development Product validates the read path.
- **Trigger:** Approval to manage Intake and Product drafts through the application.
- **Required decision:** Admin-only service/repository commands, lifecycle validation, audit behavior, and image coordination without a privileged-client shortcut.
- **Category:** Near-term feature.

### Static catalog to service-backed presentation

- **State:** The visible Catalog and Product Detail still use editorial data in `src/content`; the public Product repository currently proves the server-side data path only.
- **Why deferred:** There are no real Product rows or delivered images yet.
- **Reconsider:** Once Sprint 20's development Product and its presentation adapter are approved.
- **Trigger:** A real published development Product is safely available through the public projection.
- **Required decision:** Incremental replacement strategy that preserves card/detail composition, metadata, loading/error behavior, and image fallback.
- **Category:** Technical debt / accepted temporary state.

### Public Tags and Collections data surfaces

- **State:** Tags and Collections exist in the schema, but public projections and UI integration are deferred. `/colecciones/[slug]` is reserved but not implemented.
- **Why deferred:** Product public reads were intentionally proven first; hidden Tags and unpublished Collections require explicit public contracts.
- **Reconsider:** After the first real Product is served safely.
- **Trigger:** Real catalog filtering or collection landing pages are approved.
- **Required decision:** Minimal published-only projections, visible-tag rules, collection ordering, metadata, and SEO/internal-linking behavior.
- **Category:** Near-term catalog evolution.

### Marketing preferences UI

- **State:** The one-to-one consent model and RLS ownership rules exist; no preference-management UI or communication system exists.
- **Why deferred:** There is no approved marketing communication workflow.
- **Reconsider:** When REVA introduces marketing communications.
- **Trigger:** A stated communication purpose and legal/consent requirements.
- **Required decision:** User controls, copy, delivery provider, audit needs, and operational handling.
- **Category:** Future feature.

## Product Evolution

### Selling and donation experiences

- **State:** The Intake data model supports `sell` and `donate`, but no public submission or operational Intake UI exists.
- **Why deferred:** Customers must not directly create official Products; the real receiving and REVA decision workflow needs product requirements first.
- **Reconsider:** When either public contribution flow is approved.
- **Trigger:** An approved sell or donate user journey.
- **Required decision:** Submission data minimization, unauthenticated contributor handling, Admin processing, destination decisions, and privacy notices.
- **Category:** Future product feature.

### Rewards and contribution incentives

- **State:** Intake attribution may support future participation counts or incentives, but no reward model exists.
- **Why deferred:** It would prematurely add commercial and fraud rules before real contribution behavior is known.
- **Reconsider:** Only after an approved loyalty strategy and meaningful contribution volume.
- **Trigger:** Product decision to reward contributions.
- **Required decision:** Eligibility, attribution, fraud controls, expiry, and accounting implications.
- **Category:** Future product evolution.

### Native commerce

- **State:** Cart, orders, checkout, payments, and inventory quantity are intentionally absent. Conversion remains the configured official contact channel.
- **Why deferred:** REVA has not chosen to operate native web commerce.
- **Reconsider:** Only after an explicit business-model decision.
- **Trigger:** Approval to accept payment or orders inside REVA.
- **Required decision:** Order lifecycle, payment provider, inventory reservation, customer support, tax, refunds, and security scope.
- **Category:** Future product/business evolution.

### Search, AI, analytics, and multiple languages

- **State:** Full-text search, AI assistance, analytics architecture, and internationalization are not implemented.
- **Why deferred:** Catalog volume, assistant requirements, measurement needs, and international demand are not yet established.
- **Reconsider:** Individually, when a concrete product need is approved.
- **Trigger:** Respectively: catalog discovery evidence, approved AI user value, approved metrics plan, or supported market expansion.
- **Required decision:** A focused RFC for the specific capability; raw high-volume analytics must not be placed casually in the transactional database.
- **Category:** Future product or infrastructure evolution.

## Review Rule

An item leaves this document only when it is deliberately implemented, rejected, or superseded by an approved architectural decision. Its resolution must then be recorded in the appropriate architecture, Sprint, or RFC document rather than retained here as historical noise.
