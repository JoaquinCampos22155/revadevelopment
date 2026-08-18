# REVA Engineering Progression

## Purpose

This document records REVA's completed engineering milestones and the next approved milestone. It is the project-history counterpart to `AGENTS.md` (durable engineering law) and `DATA_ARCH.md` (current approved data architecture). It is not a source of runtime behavior or a substitute for migrations and code.

Every completed Sprint was validated within its approved scope. Later work may replace an earlier implementation boundary without invalidating the historical milestone that established it.

## Completed Sprints

### Sprint 0 — Project Initialization

Established the official Next.js App Router project with TypeScript, Tailwind CSS, ESLint, `src/`, pnpm, and the default import alias. The project builds and lints through pnpm.

### Sprint 1 — Architecture Foundation

Removed the default example experience and established the initial folder, metadata, global-style, and minimal-placeholder foundation.

### Sprint 2 — Shared Layout Foundation

Created the small reusable layout primitives (`PageContainer` and `Section`) that support page composition without prematurely creating a design system.

### Sprint 3 — UI Foundation and Design Exploration

Established the first reusable typography and button primitives and introduced the internal Playground for controlled visual exploration.

### Sprint 4 — Navigation Foundation

Created the responsive global navigation, left-aligned REVA identity, and public discovery paths.

### Sprint 5 — Home Foundation

Built the first production Home experience: value proposition, collection discovery, trust-oriented content, and editorial placeholders.

### Sprint 6 — Catalog Foundation

Built the initial browsing experience, editorial collection previews, reviews, responsive catalog structure, and replaceable placeholder-asset strategy.

### Sprint 7 — About Experience

Added the trust-focused About page, Guatemala-oriented content and SEO intent, and a catalog transition through editorial collections.

### Sprint 8 — Contact Experience

Completed the initial contact conversion path, centralized future social-link configuration, and clarified that public exploration should not expose an unconfigured external contact URL.

### Sprint 9 — Product Detail Foundation

Built the static editorial Product Detail route and its gallery, product facts, recommendations, reviews, metadata, and future configured-contact CTA boundary.

### Sprint 10 — Frontend Refinement and Freeze Baseline

Consolidated the premium retail visual direction: the approved catalog layout and cards, Home collection carousel, refined navigation and footer, restrained motion, responsive polish, Embla carousel, and a reset internal Playground. The frontend remains a maintained baseline, not a claim that visual work can never evolve.

### Sprint 11 — Backend Architectural Foundation

Established provider, service, and infrastructure boundaries without coupling REVA's business architecture to a database provider or implementing business queries.

### Sprint 12 — Supabase Foundation and Public URLs

Added the official Supabase tooling and request-safe infrastructure boundary, then standardized public routes in Spanish. Public Product URLs are canonical at `/productos/[slug]`; Collections are architecturally reserved for `/colecciones/[slug]`.

### Sprint 13 — Data Model Approval

Finalized the conceptual domain model and created `DATA_ARCH.md`. The key distinction is permanent: an Intake Item is a received physical garment; a Product is REVA's unique selling opportunity derived from at most one Intake Item.

### Sprint 14 — Production Schema and Authorization Foundation

Created, locally validated, and remotely applied Migration 001 (schema and integrity) and Migration 002 (default-deny RLS and authorization). The schema is versioned and Supabase is used only as infrastructure; normal application access preserves the caller's RLS context.

### Sprint 15 — TypeScript Domain Alignment

Aligned domain contracts, service boundaries, repositories, money handling, condition mapping, Intake, Tags, Collections, Profiles, Marketing Preferences, and Testimonials with the approved persisted model. Database-generated types remain infrastructure-only.

### Sprint 16 — Authorization Design and RLS Validation

Completed the authorization matrix, hardened the RLS auto-enable helper into the private schema, confirmed conservative deletion rules, and validated local adversarial access scenarios before remote deployment.

### Sprint 17 — Supabase Security Context Design

Defined the four request contexts: public visitor, authenticated customer, authenticated admin, and privileged infrastructure. The project intentionally avoids using a privileged credential as a normal repository shortcut.

### Sprint 18 — Authentication and First Admin Bootstrap

Implemented email/password authentication with email confirmation, cookie-backed SSR sessions, request proxy refresh, logout, automatic customer Profile provisioning, `SupabaseProfileRepository`, and the controlled first-admin bootstrap. Development email delivery uses temporary Mailtrap Sandbox infrastructure.

### Sprint 19 — Public Catalog Read Foundation

Created and remotely applied Migration 004. Published Product reads now flow through explicit `api` schema projections, the request-scoped publishable Supabase context, `SupabasePublicProductRepository`, `ProductService`, and safe public domain contracts. No Product data, Storage, Product Manager, or production UI replacement was introduced; the visible Catalog and Product Detail continue to use editorial static content.

### Sprint 20 — Product Manager Foundation and First Development Garment

Created and remotely applied Migrations 005 and 006, establishing the admin-only, session-bound Product Manager draft workflow. A draft atomically creates one Intake Item and one Product while preserving RLS, private Intake data, exact money handling, automatic SKU generation, and the Product lifecycle boundary.

The first development garment validated the real operational path as `RV-000001` in `draft` state. Product Manager now governs audience, garment type, alpha-size entry, color, and condition through centralized application-owned vocabularies; free text remains only where it represents editorial or genuinely open facts. The controlled vocabularies are intentionally preliminary and their evolution triggers are recorded in `TO_CONSIDER.md`.

No Product was published, no public Catalog presentation changed, and Product images remain intentionally deferred.

## Current Implementation Snapshot

- The public frontend is visually established and uses Spanish public routes: `/`, `/catalogo`, `/productos/[slug]`, `/nosotros`, `/contacto`, and `/iniciar-sesion`.
- `/colecciones/[slug]` is an approved public URL architecture but is not yet implemented as a route. `/playground` is internal and non-indexed.
- Auth is real: email/password signup, email confirmation, cookie-backed sessions, logout, one customer test identity, and one admin test identity exist only in the development environment.
- Migrations 001–006 are the versioned database history. Base business tables are default-deny; only the deliberately allowlisted `api` Product projections are anonymously readable.
- The public Product repository is an integration proof. The customer-facing catalog and Product Detail have not yet switched from editorial static content to database-backed presentation.
- Product Manager can create and edit secure drafts. One development Product exists; it remains unpublished and unavailable through public projections.

## Next Planned Milestone

### Sprint 21 — Product Media Pipeline

**Status:** Next planned milestone.

**Objective:** Introduce Product-owned image upload, storage, delivery, and removal boundaries without exposing raw storage keys or weakening the Product Manager security model.

## Working Method

REVA follows the durable workflow defined by `AGENTS.md`:

```text
Research -> Reason -> Implement -> Validate -> Document
```

Each new Sprint should record only its durable outcome here, update `DATA_ARCH.md` when it changes approved data architecture, and move intentionally deferred work to `TO_CONSIDER.md`.
