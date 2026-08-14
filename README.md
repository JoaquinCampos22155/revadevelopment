# REVA

REVA is a Guatemalan circular-fashion discovery platform. It combines a Spanish, server-rendered public experience with a provider-independent domain architecture and Supabase infrastructure for authentication and approved data boundaries.

## Documentation Map

- [`AGENTS.md`](AGENTS.md) — permanent Engineering Constitution.
- [`DATA_ARCH.md`](DATA_ARCH.md) — approved data model, authorization, provider, and public-data architecture.
- [`SPRINTS.md`](SPRINTS.md) — completed engineering milestones and the next planned Sprint.
- [`TO_CONSIDER.md`](TO_CONSIDER.md) — deliberately deferred decisions and accepted temporary states.

## Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS
- pnpm
- Supabase JavaScript and SSR clients for infrastructure integration
- Embla Carousel for the approved Home collections carousel
- Supabase CLI for versioned local migration validation

## Prerequisites

- Node.js compatible with the checked-in Next.js version
- pnpm
- Docker Desktop only when running the local Supabase stack or validating migrations locally

Docker is development tooling, not a REVA production/runtime dependency. The ordinary Next.js application can run without the local Supabase Docker stack when it is configured to use the hosted development project.

## Environment Setup

Create a local-only `.env.local` file from `.env.example` and supply the hosted development project's browser-safe values:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

The publishable key is safe for browser delivery, but it is not a permission bypass: Row Level Security and the deliberately exposed `api` projections enforce data access. Never add secret, service-role, database-password, SMTP, or personal credentials to `.env.local` files intended for application code, source control, or client-visible variables.

## Run the Application

```bash
pnpm install
pnpm dev
```

The public experience includes `/`, `/catalogo`, `/productos/[slug]`, `/nosotros`, `/contacto`, and `/iniciar-sesion`. `/playground` is an internal non-indexed route.

## Quality Checks

```bash
pnpm lint
pnpm build
```

## Local Supabase and Migrations

The `supabase/` directory contains the authoritative, versioned schema history. Do not recreate schema changes manually in the Dashboard.

```bash
pnpm supabase start
pnpm supabase db reset --local
pnpm supabase db lint --local
pnpm supabase db advisors --local --type security --level warn
```

Run local validation against an empty local database before proposing a remote migration. Linking, pushing, resetting, or otherwise mutating the hosted Supabase project requires explicit developer approval. The hosted Data API exposes only the approved `api` public Product projections; business tables remain protected by RLS and grants.

## Current Boundaries

- UI components do not query Supabase directly.
- Normal request-scoped repositories use the publishable key and the real visitor/customer/admin session; they do not use privileged credentials as a shortcut.
- Public Product reads use safe published-only `api` projections and map them into public domain contracts.
- The customer-visible Catalog and Product Detail still use editorial static content while the first real Product path is being proven.
- Product Storage, uploads, Product Manager, Orders, Checkout, and production email infrastructure are intentionally not implemented yet. See `TO_CONSIDER.md`.

## Contribution Rules

Use pnpm for project commands. Keep public routes in `src/app`, shared presentation in `src/components`, feature-specific code in `src/features`, source-controlled editorial content in `src/content`, and provider adapters in `src/infrastructure`. Follow `AGENTS.md` before making a material architectural, security, provider, or dependency decision.
