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

- **State:** `api.published_product_previews`, `api.published_product_details`, and `api.published_product_images` intentionally read through their migration owner so anonymous base-table access can remain denied. They use fixed allowlists, a completed-publication predicate, and explicit view grants. Current local Security Advisor validation reports no warning.
- **Why deferred:** The boundary still needs production-specific review before public catalog data is exposed at scale.
- **Reconsider:** Before public production catalog launch.
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

### Post-publication Product-media synchronization

- **State:** Publication materializes private authoritative WebPs into public delivery copies. Published Product media is intentionally immutable until the Product returns to draft.
- **Why deferred:** Bidirectional synchronization or in-place public-media replacement would create cross-storage consistency and cache-invalidation complexity before recurring operational use proves it necessary.
- **Reconsider:** When operators need to change media on already published Products without temporarily removing them from the Catalog.
- **Required decision:** A safe synchronization, rollback, cache, and public-delivery consistency model.
- **Category:** Product-media lifecycle evolution.

### Product Detail media gallery / carousel UX

- **State:** The current Product Detail gallery renders all approved Product images as a static responsive composition. It is functional with real six-image media, but can create excessive vertical length and uneven visual weight.
- **Why deferred:** This is a non-blocking presentation refinement. REVA is prioritizing Product lifecycle and operational capability before broad UX polish.
- **Reconsider:** Before final UX/UI polish or production launch.
- **Trigger:** Real Products commonly contain approximately five to six images.
- **Required decision:** An accessible, responsive gallery interaction that considers primary-image prominence, previous/next controls, thumbnails or position indicators, keyboard and touch interaction, image inspection, PDP length, and Next Image performance. Evaluate dependencies only after the interaction is approved.
- **Category:** Product Detail UX refinement.

### Public Product image SEO / indexing strategy

- **State:** Public delivery URLs use immutable opaque ProductImage identities rather than mutable Product titles or slugs. Product/image association currently comes from the canonical Product page, semantic image markup, alternative text, surrounding Product content, and stable crawlable delivery URLs.
- **Why deferred:** Renaming Storage objects for mutable Product facts would create URL churn, cache invalidation, and redirect complexity without evidence of enough SEO benefit.
- **Reconsider:** Before production launch.
- **Required decision:** A cohesive Product image SEO strategy covering alt-text quality, canonical Product relationship, Product structured data / schema.org markup, image indexing, image-sitemap need, and whether descriptive image URLs justify their operational cost. Preserve immutable ProductImage identity unless evidence supports a different architecture.
- **Category:** Pre-launch SEO requirement.

### HEIC / HEIF source photography

- **State:** Initial Product media accepts JPEG and PNG only.
- **Why deferred:** HEIC support depends on reliable server image-decoder support across development and deployment targets.
- **Reconsider:** When operators regularly source HEIC photos.
- **Required decision:** Tested decoder/runtime support and a clear customer-safe conversion path.

### Product-media retention after lifecycle changes

- **State:** Product media is retained while Product lifecycle policy is still being defined.
- **Reconsider:** Before publishing sold or archived Product pages.
- **Required decision:** SEO, historical catalog pages, storage cost, and operational-retention policy.

### Production media processing / hosting boundary

- **State:** REVA's trusted processor accepts normal source photography up to 12 MiB, but a final production hosting arrangement has not been selected.
- **Why deferred:** Hosting must be evaluated against REVA's media requirement rather than lowering image quality or requiring operator compression to fit an unapproved platform.
- **Reconsider:** Before production deployment.
- **Required decision:** A Node-capable ingress/processing boundary that accepts at least the approved source limit, preserves server-side Sharp processing, and does not persist originals.
- **Category:** Pre-launch infrastructure requirement.

### Decoded-image ceiling

- **State:** Source media is limited to 24 MP as a decompression and memory safeguard; the first real REVA set sits exactly at that boundary.
- **Why deferred:** There is no evidence yet that ordinary REVA devices require a higher ceiling.
- **Reconsider:** When normal operator devices produce legitimate photography above 24 MP.
- **Required decision:** Memory/runtime benchmark and an updated safety ceiling that avoids requiring normal operators to resize photographs.
- **Category:** Product-media operations.

### Existing Product media management / Product lookup

- **State:** Product media operations work against an existing Product ID and Product edit already supports adding, ordering, deleting, and describing media. There is no dedicated lookup or media-management workflow.
- **Why deferred:** Direct navigation through the current draft list is sufficient for the first operational use; a separate subsystem would be speculative.
- **Reconsider:** When operators routinely revisit Products after initial entry or the current list is no longer efficient.
- **Required decision:** The smallest safe lookup by SKU, title, or another approved identifier, plus focused internal navigation for existing Product media operations.
- **Category:** Product Manager evolution.

### Product Manager and official Product operations

- **State:** Product Manager creates and edits administrator-owned Intake/Product drafts through session-bound, RLS-enforced RPCs. Contributor association remains absent.
- **Why deferred:** Each remaining capability requires its own lifecycle or privacy boundary; draft entry should not invent those capabilities prematurely.
- **Reconsider:** Individually when its product boundary is approved.
- **Trigger:** A safe contributor lookup design is approved.
- **Required decision:** A safe human-readable Profile lookup that does not expose UUIDs or duplicate Auth identity data.
- **Category:** Near-term feature.

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

### Garment-type taxonomy management

- **State:** Product Manager uses a centralized application-owned controlled garment-type vocabulary. The Product field stores its stable value; labels are presentation.
- **Why deferred:** The current operational vocabulary is small and changes deliberately. A reference table or taxonomy-management UI would add governance infrastructure before operational volume requires it.
- **Reconsider:** When updating the centralized application vocabulary through a code deployment becomes operationally limiting.
- **Trigger:** Frequent approved vocabulary changes, multiple operational teams, or a demonstrated need to manage taxonomy without a deployment.
- **Required decision:** Database-backed taxonomy, administrative ownership, migration/normalization policy, and how stable stored values map to labels.
- **Category:** Product data-governance evolution.

### Multi-system garment sizing

- **State:** Product Manager currently uses a centralized, controlled alpha-size vocabulary and persists the selected `size_label` or `NULL`. This is intentionally preliminary, not a claim that alpha sizes are universal.
- **Why deferred:** Second-hand garments legitimately use alpha sizes, jeans or waist sizes such as `28` or `32`, numeric fashion or dress sizes, European sizes, children's age or manufacturer systems, One Size / Talla Única, and other manufacturer-specific labels. A universal engine now would invent policy before REVA has real inventory evidence.
- **Reconsider:** When the controlled application vocabulary no longer supports fast, faithful operational entry or Catalog discovery needs distinguishable sizing systems.
- **Trigger:** Garments frequently fall outside the vocabulary; configuration edits become repetitive; filtering requires systems to be distinguished; cross-system filtering is needed; operators need manufacturer size and REVA-normalized size separately; size recommendations or conversions are approved; or children's inventory requires age/height-based sizing.
- **Required decision:** Whether to introduce concepts such as `size_system`, `manufacturer_size`, and `normalized_size`, and whether they require database-backed controlled taxonomy or administration. A future model must preserve original manufacturer information — for example `40` with system `EU`, or `32` with system `waist_inches` — independently from any REVA interpretation such as `M`.
- **Category:** Product data-governance evolution.

### Controlled color evolution

- **State:** A Product currently has one application-controlled color classification. `bicolor` and `multicolor` are valid classifications but do not preserve their constituent colors.
- **Why deferred:** A Product-to-Color model would add taxonomy and relationship infrastructure before catalog evidence requires it.
- **Reconsider:** When a customer must discover garments containing a specific color even when classified bicolor/multicolor, those garments become common, operators need primary and secondary colors, recommendations/search require constituent-color semantics, or operators regularly cannot choose one classification.
- **Required decision:** Whether the smallest suitable model is primary/secondary colors, controlled multiple colors, a Product-to-Color relation, or another deliberate structure.
- **Category:** Product data-governance evolution.

### Product Manager brand suggestions

- **State:** Brand remains simple free text.
- **Why deferred:** The first Product entry did not establish a need for a Brand reference table or taxonomy.
- **Reconsider:** When repeated known brands make entry slower or inconsistent.
- **Trigger:** Operators benefit from suggestions based on previously used values while retaining simple brand text.
- **Required decision:** A safe suggestion/read model without prematurely making Brand a reference entity.
- **Category:** Product Manager UX evolution.

### Product Manager visual refinement with media

- **State:** The first operator test found the draft form fast and its ordering appropriate; its visual hierarchy can improve.
- **Why deferred:** Sprint 21 media will materially change the Photos section and the form's layout.
- **Reconsider:** With the approved Product Media Pipeline.
- **Trigger:** Real media is available to assess the final operational rhythm.
- **Required decision:** Focused visual polish based on the media-integrated workflow, not a standalone redesign.
- **Category:** Product Manager UX evolution.

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
