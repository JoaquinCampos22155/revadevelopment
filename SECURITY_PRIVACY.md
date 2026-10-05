# REVA Security and Privacy Context

## Purpose and Authority

This document is the durable source of truth for REVA's current privacy/security posture, known gaps, feature-assessment rules, and evidence expectations. It records architecture and requirements; it does not replace migrations, RLS SQL, legal advice, or an approved implementation plan.

Read it before work involving security, privacy, Auth, users, uploads, Cart, chatbot, checkout, payments, analytics, or a new category of stored/processed data. Use `DATA_ARCH.md` for implemented schema/RLS/storage detail, `REVA_BUSINESS.md` for business/policy decisions, and `REVA_ROADMAP.md` for strategic sequencing.

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
- Security headers.
- Supabase Auth leaked-password protection.
- CSRF/origin posture for the custom media route.
- Upload abuse/rate policy.
- Observability and incident runbook.
- Backup/recovery ownership.
- Historical S-01–S-06 definitions remain unrecovered; do not claim them fixed or redefine them without evidence.

## Sprint 27 Dependency Evidence (2026-10-04)

The local dependency tree was rebuilt from the approved frozen lockfile after a Windows/Codex sandbox file-access restriction affected its initial installation. `pnpm lint` and `pnpm build` pass with Next `16.3.8`; public routes, Product catalog/PDP reads, static images, anonymous admin protection, and the media Route Handler's unauthenticated `401` response were smoke-tested locally.

Disposable in-memory Sharp `0.35.5` fixtures verified JPEG, PNG, progressive JPEG, automatic orientation, 2560px maximum-edge resizing, WebP output, corrupt-input rejection, the 24 MP decoded-pixel boundary, and the 12 MiB application boundary. A benign EXIF fixture was absent from the resulting WebP. The tests used no Supabase, Storage, Product, or other remote mutation.

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
| Provider logs | Operational provider/runtime telemetry subject to provider configuration and access controls. |
| Environment configuration | Runtime settings and secrets held outside source control. |

Today REVA stores no Cart data, Order data, Payment data, chatbot transcript data, or analytics data. This inventory must be updated when any such feature is introduced.

## Feature Privacy Rule

Before introducing a feature that creates a new category of stored or processed data, update this document with the data purpose, access boundary, retention/deletion implications, provider exposure, and required evidence. Examples include Cart persistence, chatbot transcripts, analytics identifiers, Orders, payment metadata, and shipping addresses.

## Chatbot Security Rule

The chatbot begins only with approved REVA business knowledge, curated FAQs, and optionally an allowlisted public Product projection. It has no raw database access, no write actions, and no admin/private tools. Any future tool or action requires a separate security review and explicit approval.

## Commerce Security Rule

Cart does not imply reservation. Future checkout/payment work must:

- use the authoritative server/database Product price;
- guarantee that a unique Product cannot be sold twice;
- separate Order from Payment;
- verify payment server-side/provider-side;
- use idempotency;
- never trust browser payment success;
- never store PAN or CVV; and
- preserve evidence suitable for faculty review.

This is architectural direction, not approval to implement commerce.

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
