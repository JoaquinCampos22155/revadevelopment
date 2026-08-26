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

### Sprint 21 — Product Media Pipeline

Created and remotely applied Migration 007, establishing the private `product-media` Storage boundary and admin-only Product Image metadata operations. Product media is processed only in the trusted Node boundary: source JPEG/PNG is auto-oriented, resized without upscaling, stripped of metadata, encoded as WebP, stored privately, and represented through ordered Product Image metadata. Admin previews are signed delivery data; raw storage keys remain internal.

The first real media run completed for development Product `RV-000001`, which remains a private draft. Six original camera photographs were independently processed and stored as six optimized WebP assets with contiguous positions. Real operating evidence established the initial source policy: 12 MiB source ceiling, 24 MP decoded-pixel ceiling, maximum 2560 px long edge, WebP quality 82, and a 5 MiB persisted-object ceiling. Original source files are not retained in Supabase.

No Product was published, no public Catalog or Product Detail presentation changed, and draft media remains inaccessible to anonymous visitors and customers.

### Sprint 22 — Publication & Catalog Integration

Created and remotely applied Migrations 008 and 009, establishing lifecycle-controlled public media materialization and closing the public-media Storage write/delete bypass. Publication now requires approved Product facts, ordered private WebP media, and completed public delivery copies before a Product becomes visible through the safe public projections.

The first real Product, `RV-000001`, was published successfully. Its six private authoritative WebPs remain intact, six matching public delivery WebPs were materialized, and the public `api` projections expose only approved Product and image fields. Catalog and Product Detail now use the server-rendered `ProductService` → `SupabasePublicProductRepository` path with real published data, primary-image Catalog cards, ordered Product Detail galleries, canonical metadata, and normalized customer-facing labels. The first customer-facing visual inspection found no blocking public UX defect.

### Sprint 23 — Immediate Security Remediation

Remediated the known dependency vulnerabilities without changing REVA's domain, Supabase, Storage, or lifecycle architecture. Next.js and `eslint-config-next` now resolve to `16.3.3`; React, React DOM, and Sharp remain on their approved versions. Narrow pnpm overrides resolved the remaining development-tooling advisories, and `pnpm audit` is clean.

Verified public, customer, and admin runtime behavior after the upgrade. RV-000001 remains published with its six private authoritative WebPs and six public delivery copies. The Next agent-guidance auto-generation feature is disabled so REVA's constitutional `AGENTS.md` remains its sole owner.

## Current Implementation Snapshot

- The public frontend is visually established and uses Spanish public routes: `/`, `/catalogo`, `/productos/[slug]`, `/nosotros`, `/contacto`, and `/iniciar-sesion`.
- `/colecciones/[slug]` is an approved public URL architecture but is not yet implemented as a route. `/playground` is internal and non-indexed.
- Auth is real: email/password signup, email confirmation, cookie-backed sessions, logout, one customer test identity, and one admin test identity exist only in the development environment.
- Migrations 001–009 are the versioned database history. Base business tables are default-deny; only the deliberately allowlisted `api` Product projections are publicly readable.
- Catalog and Product Detail use database-backed published Product presentation through the public repository while preserving editorial Catalog structure.
- Product Manager can create and edit secure drafts and manage private optimized media. `RV-000001` is the first published development Product with six private authoritative WebPs and six public delivery copies.

## Next Planning Gate

Sprint 24 — Catalog Filtering Foundation — is closed. Migration 010 is deployed; real Catalog filtering passed technical and manual UX validation. Tags, Collections, recommendations, text search, contextual facets, and the broader visual-system refinement remain separate future work.

## Working Method

REVA follows the durable workflow defined by `AGENTS.md`:

```text
Research -> Reason -> Implement -> Validate -> Document
```

Each new Sprint should record only its durable outcome here, update `DATA_ARCH.md` when it changes approved data architecture, and move intentionally deferred work to `TO_CONSIDER.md`.
