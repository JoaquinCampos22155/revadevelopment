# REVA Roadmap

## Purpose and Authority

This document is REVA's durable high-level direction from the current MVP toward the final graduation-ready product. It owns strategic workstreams, their dependencies, and current priorities; it is not a Sprint history, implementation authorization, or provider-selection record.

- `AGENTS.md` owns durable engineering rules and routes context.
- `REVA_BUSINESS.md` owns approved business/content decisions and unresolved business policy.
- `DATA_ARCH.md` owns implemented data, authorization, storage, and lifecycle architecture.
- `SECURITY_PRIVACY.md` owns durable privacy/security context and evidence expectations.
- `SPRINTS.md` owns completed implementation history and current milestone state.
- `TO_CONSIDER.md` owns non-blocking deferred ideas.

## Current Baseline

REVA has a public MVP deployed on Render with a Supabase backend, public Catalog and PDPs, Product Manager, curated recommendations, and real inventory. Migrations M001–M016 are part of the implemented architecture. The approved official domain is `https://revagt.com`; read-only checks on 2026-10-22 found both the apex and Render hostname serving HTTPS with Catalog/Product canonicals set to the official apex, and `www` redirecting to the apex. This confirms the runtime is using the official canonical origin, but does not expose Render's variable value or deployed commit. Supabase Auth URL settings remain unverified.

The anonymous Cart remains browser-local and does not reserve inventory. The public `/checkout` remains non-transactional and opens a WhatsApp inquiry; it does not submit or persist customer form data. Transactional request/Order schema and manual payment coordination are implemented, and the developer reports hosted migrations M017–M024 applied. That external migration and production-key state was not re-verified in this domain task. Production customer-data collection and transactional Checkout remain disabled; payment integration/automated verification, FEL, chatbot, and analytics are not active.

## Approved Preferred Workstream Order (2026-10-08)

This is the developer-approved preferred sequence for future REVA work. It records priority, not permission to activate a transactional flow, begin a specific Sprint, change providers, or bypass the approval gates described below.

1. **REVA Experience & Visual Redesign — Priority #1.** The current site is functional but reads as repetitive and informational. Evolve it toward a modern, elegant, editorial, immersive, interactive, ecommerce-oriented identity. Make pages shorter and stronger rather than adding sections: reduce repeated copy and repeated heading/paragraph/card patterns; strengthen hierarchy and first-viewport impact; use meaningful photography, composition, depth, layering, and purposeful interaction. Depth should come from composition and interaction, not merely more borders or shadows. Redesign one page at a time after review and approval of its visual direction. Preserve its approved functionality, REVA business rules, security boundaries, accessibility, and real Product data; this does not authorize a simultaneous site-wide rewrite.
2. **Checkout UX and non-transactional architecture — inquiry implementation complete.** The official `/checkout` is implemented as an editable in-memory review and WhatsApp purchase inquiry using current public Products. No personal fields are submitted or stored; it creates no Orders, paid transactions, reservations, or invoices. Continue visual/security review. Transactional Checkout remains gated by Orders, atomic inventory reservations, authoritative prices, payment verification, and approved policies/providers.
3. **REVA Motion & Interaction System.** After the initial public visual redesign and Checkout UX/architecture, establish purposeful, accessible interaction patterns across approved experiences. Explore motion as part of the experience—not only decoration—including product/button feedback, drawer and page transitions, image/section reveals, justified scroll-linked storytelling, and loading/success states where they improve understanding or continuity. Use native browser capabilities or a maintained library when it materially improves quality; do not animate everything. Respect reduced motion, keyboard/screen-reader behavior, and performance. This remains a separately scoped workstream rather than permission for a blanket component rewrite.
4. **Interactive 3D garment visualization per Product — DEFERRED, NOT CANCELLED.** This is postponed behind the current public-experience work and is not authorized for a prototype or substitute now. When explicitly resumed, explore AI-assisted reconstruction from real front/back garment photographs, pre-generated and optimized floating models, and horizontal Y-axis rotation by mouse or touch. Keep real Product photographs authoritative and require human quality approval before publication.
5. **Catalog discovery improvements.** Improve how visitors find and compare garments while preserving public discovery and current Product/data/security boundaries.
6. **REVA-specific chatbot.** Integrate an existing model or service; do not train a foundation model from scratch. Keep the assistant within REVA, fashion, garments, Catalog, buying, selling, donation, and circular-fashion topics. It must have no unrestricted database, admin, private-data, or write access. Design cost limits, rate limits, prompt-injection defenses, topic boundaries, and human handoff before implementation.
7. **Temporary purchase requests, Orders and atomic inventory reservations.** Implement the approved non-reserving, individually expiring 24-hour request stage first, then have authorized admin approval atomically create/promote an Order pending payment and reserve its unique Products for three hours. Ensure expired requests cannot be approved, request data is fully deleted on expiry/discard, and holds cannot double-sell or survive their approved window. This is approved future architecture, not active functionality.
8. **Payment coordination, verification and Guatemala FEL.** Recurrente is the approved future surface for an authorized administrator to manually verify payment before marking an Order paid; it is not onboarded or integrated. Validate current merchant terms and capabilities before any payment-link process. Confirm Guatemala-specific FEL, billing, refund, delivery, and sequencing requirements before provider integration or invoice issuance. Do not assume unverified legal requirements or fees.

### 3D Direction — Deferred, Not Cancelled

No 2.5D substitute or 3D prototype is in scope while this milestone is deferred. If the work is explicitly resumed later, prefer free or low-cost AI-assisted reconstruction from real front/back garment photographs, with pre-generated optimized models presented as floating garments and horizontal Y-axis rotation using mouse or touch. A human must approve each model before publication. Real photographs remain the authoritative evidence of the actual garment and condition; a model must not invent, erase, conceal, or contradict garment details. Before an approved pilot, research reconstruction accuracy and limits, performance/mobile fallback, accessibility, privacy and source-image handling, pipeline/storage ownership, and per-garment cost. Any pilot and its acceptance criteria require a separate proposal and approval.

## Persistent Workstreams

### Cybersecurity

- Dependency remediation and remaining audit findings.
- Web security headers, CSRF/origin posture, and abuse/rate controls.
- Auth hardening, RLS/RPC evidence, upload security, observability, and incident readiness.
- Evidence suitable for independent faculty verification.

### Privacy

- Data inventory, minimization, retention, deletion/account requests, and privacy notice.
- Provider disclosure, cookie/tracking decisions, and privacy evidence.

### Users and Account Lifecycle

- Potential password reset, account deletion, privacy requests, and minimal profile functionality.
- Avoid speculative CRM complexity; collect only data justified by a defined user purpose.

### Custom Domain

- **Selected:** `https://revagt.com` is the official public domain; `https://reva-gt.onrender.com` remains an alternative technical entry point. DNS/HTTPS were checked read-only, and `www` returned a permanent redirect to the apex.
- **Current state:** live Catalog and PDP canonical tags now use the official apex. Render Auth-entry GET redirects and a safe callback redirect correction are present only in the local working tree and are not deployed. Live Render login/recovery entries still return 200; live tokenless `/auth/confirm` currently redirects to internal `https://localhost:10000/...` on both hosts. The local callback correction emits relative, allowlisted destinations and preserves host-scoped callback cookies.
- **Auth configuration:** the developer reports the Supabase Site URL/Redirect URLs and email templates have been updated; those Dashboard settings remain independently unverified. POST Server Actions and `/auth/confirm` are excluded from the legacy-host proxy redirect; a reset request with a Supabase session cookie remains on its current origin.
- **Do not:** globally redirect the Render hostname or assume domain consolidation is complete until the local fixes are released, runtime callbacks are rechecked, Supabase settings are verified, and safe real Auth flows pass.

### Cart / Selection

**Implemented locally in Sprint 30:** anonymous browser-local selection using only public Product slugs; one of each unique garment; public-projection revalidation on Drawer/page/conversion; current prices; unavailable items remain visible for removal and are excluded from subtotal/conversion; a Drawer and noindex `/carrito`; and WhatsApp selection inquiry. Cart does not reserve inventory or approve Checkout. See `SECURITY_PRIVACY.md` for the local-storage data boundary and `SPRINTS.md` for validation evidence.

### Checkout

**Current:** Official `/checkout` supports direct PDP and Cart entry and revalidates current public Product facts before a user-initiated WhatsApp inquiry. Its contact/delivery/billing values are transient in-memory UI review only; no Order, reservation, personal-data submission, payment processing, or invoice occurs. The map is deferred and text municipality/zone controls are not a delivery-coverage promise.

**Future transactional gate:** Checkout must remain non-transactional until Orders and atomic unique-Product reservations, authoritative price snapshots, payment verification, and approved operational policies/providers exist. Research whether and how FEL, NIT, Consumidor Final (CF), invoice identity, issuance, and payment/invoice sequencing apply; do not present candidate questions as established legal requirements.

**Approved commercial lifecycle (2026-10-15; direction only, not production-enabled):** `Temporary Purchase Request → Admin Approval → Confirmed Order → Payment Coordination → Verified Payment → Fulfillment`. A temporary request does not reserve inventory and expires per-request exactly 24 hours after its server-recorded `created_at`; the backend must reject approval after `expires_at`, even if cleanup is delayed. Admin approval revalidates current availability and authoritative prices, then creates/promotes an Order in pending-payment state and atomically reserves the garments for three hours; approval is not payment confirmation. The Order retains the originating request's 24-hour deadline; inventory release at hour three does not shorten it. At that deadline, delete unpaid Orders and operational data unless payment is verified or an unresolved financial incident is documented. A paid or incident Order follows its separately approved/legal retention schedule. These deletion rules do not establish backup-erasure timing. Future requests use separate first/last name, telephone, delivery address and municipality/zone, conditional billing data, immutable verified Product/price/SKU snapshots, and a non-authorizing customer reference. The local-only foundation and retention migration exist; production collection, hosted migrations, provider configuration, payments, and release remain gated. See the 2026-10-16 preflight in `SPRINTS.md`.

**PDP handoff:** The desktop hover magnifier is **DEFERRED / NOT WORKING**, based on the developer's browser report after multiple attempts. It is not verified or approved; the PDP may proceed to the next workstream without being declared defect-free. Preserve the existing gallery, thumbnails, arrows, keyboard navigation, and mobile zoom. Do not attempt another magnifier fix during Checkout. Revisit only with reliable browser-level debugging; see `TO_CONSIDER.md`.

**Checkout discovery recommendation (2026-10-14; superseded by the approved implementation below):** The proposal for direct PDP and multi-item Cart entry, public server-side Product resolution, no Order/reservation on entry, and a mobile-first editable flow has been adopted as a non-transactional inquiry implementation; transactional submission, address persistence, payments, and invoice issuance remain unapproved.

Initial delivery remains courier/shipping in Guatemala City only; provider, exact coverage, address-field requirements, delivery timing, and shipping-cost policy remain unresolved. Do not offer unsupported department/municipality coverage, fees, thresholds, or estimates. Determine the smallest location/address fields required by the selected real delivery operation and disclose a confirmed delivery charge before commitment.

**Approved customer-facing purchase policy; remaining fulfillment details:** Customers may cancel before REVA confirms dispatch and request a delivery-address change before dispatch, subject to coverage and possible cost adjustment. There are no general change-of-mind returns, without excluding applicable consumer rights. Wrong-garment or significant-undisclosed-defect claims are reviewed; prompt reporting with photos/opening video is recommended, not an absolute rights-extinguishing condition. Internal credit is the usual remedy, with other case-appropriate solutions available under circumstances and applicable rights; REVA determines collection/return-shipping handling for accepted returns. Still define operational serviceability, exact shipping charges/timing, failed delivery and post-dispatch handling before transactions. Current Checkout remains a non-transactional inquiry with no reservation or shipping guarantee. The approved three-hour hold starts atomically with admin approval/Order creation; no hold is currently implemented.

SAT's current public FAQ says “Consumidor Final” may be used in the recipient identification field only for invoices below Q2,500; for Q2,500 or more it lists NIT, or CUI for an individual without NIT, and passport/tax code for a foreign recipient. SAT's minimum-DTE guide lists recipient name and says address is optional and shown only if supplied. These are source findings, not a complete legal opinion or approved REVA invoice policy. Before forms or FEL integration, a qualified Guatemalan tax adviser must confirm the current rule, REVA's issuer/tax regime, who issues the buyer invoice under REVA's 65/35 selling arrangement, tax treatment, the invoice provider, and when to issue relative to payment/refund. Avoid collecting NIT/CUI/address until required for the selected approved process.

Payment operations remain future work: Recurrente manual verification by an authorized administrator is the approved future rule, but merchant onboarding, a payment-link process, provider integration, and technical/contract verification remain incomplete. The developer-reported 5.25% + Q2 per-transaction fee is unverified and must be checked against current merchant terms. If the reported rate `r` applies to the full amount including a customer surcharge `F`, and `B` is the rest of the provider fee base (including shipping only if the provider charges on it), covering a fee `r(B + F) + Q2` would require solving `F = r(B + F) + Q2`, i.e. `F = (rB + Q2)/(1-r)` before any confirmed tax/rounding adjustments. This is a planning equation only—not a validated provider tariff, approved buyer surcharge, or production calculation. Confirm provider permission, tax treatment, rounding, refunds, whether taxes are included, whether shipping is in the fee base, and full-total disclosure before implementation. No fee is currently charged by REVA through Checkout. Keep card data on the provider-hosted surface; REVA must never collect or store PAN/CVV and must treat payment as complete only after trusted server/provider verification.

Temporary requests and Orders/reservations are distinct. Implement the approved request stage first: server-created `created_at` and per-request `expires_at = created_at + 24 hours`; no inventory hold, automatic extension, or approval after expiry regardless of cleanup. Expired/discarded requests and associated data must be deleted completely from operational stores without request-derived marketing metrics; document/test backup limitations before collection. Admin approval must revalidate current availability and authoritative prices, then atomically create/promote the Order pending payment and reserve each unique Product for three hours. An authorized administrator manually verifies payment in Recurrente before marking paid. The business trigger and verification method are approved, not implemented. Schema/RLS/RPC, idempotency, hold expiry/release and late-payment recovery, key management, retention and tests still require an ADR/implementation. No request/Order table, reservation, migration, payment link or integration currently exists.

**PDP → Checkout entry (implemented):** a visible `Comprar ahora` link starts `/checkout` with only that Product's public slug; it does not touch the browser Cart. `Agregar al carrito` remains separate. Checkout re-resolves current published availability/price and does not create an Order or reservation on entry. Do not add customer-data transmission or payment claims until the transactional prerequisites and separate security/privacy review are approved.

**Guatemala map/address discovery (2026-10-14; map deferred):** Checkout geography is limited to the 17 municipalities of Departamento de Guatemala, with fixed department and stable INE municipality codes. This is not a delivery-coverage promise: current approved delivery remains Guatemala City, and municipality/zone serviceability must be defined against actual operations. The interactive map is deferred, not cancelled; do not bundle or redistribute municipal/zone polygons until source, completeness, accuracy, version, and reuse license are verified. Text controls remain usable without map geometry. Checkout form data are transient browser-memory review only; no address persistence, guest Order, analytics, or migration is approved.

Future data design should keep geographic reference catalogs, serviceability/rates, optional owner-protected saved addresses, and immutable Order delivery-address snapshots as distinct concepts. Any zone/municipality sales reporting must derive from actual Orders and be aggregated, not from saved-address counts or exposed address-level data. This proposal does not amend `DATA_ARCH.md`'s implemented schema or current no-address data inventory; see the dated discovery record in `SPRINTS.md`.

### Payments

Recurrente is the developer's intended future candidate, but provider selection remains conditional on onboarding, direct fee/contract confirmation, technical verification, settlement/refund behavior, trusted payment status, GTQ support, and FEL interoperability. The reported 5.25% + Q2 fee and any proportional buyer charge are not approved public pricing. Do not design as if Recurrente (or another provider) is already selected; payment verification must be server/provider-authoritative before an Order is treated as paid.

### Transactional implementation and release sequence — 2026-10-15

This is the approved delivery order for the transactional workstream, not authorization to begin any phase. Privacy/security controls apply throughout, not only at the final test phase. Cloudflare domain setup and Recurrente onboarding may proceed in parallel when separately authorized.

1. Complete remaining operating readiness and qualified Guatemala legal/fiscal review: seller payout/intake operations, delivery serviceability and cost, request-deletion/backup behavior, and transactional/refund/FEL requirements. Buyer cancellation/claim and privacy-request policies are approved; Q5 seller lot fee and the future three-hour admin-approval hold/manual Recurrente verification are approved directions, not active systems.
2. Validate the accumulated Git changes, prepare approved commits, and push to `development` only under separate Git authorization.
3. Approve the transactional schema, authorization/RLS/RPC, encryption/key-management and recovery ADR.
4. Implement per-request 24-hour temporary purchase requests with no inventory reservation and secure guest submission.
5. Implement Orders and atomic three-hour reservations initiated at admin approval, with concurrency and hold-expiry/release safeguards.
6. Implement the authorized admin “Gestión → Solicitudes y órdenes” workflow and auditable actions.
7. Set up the custom domain with Cloudflare and verify canonical URLs, hosting, Auth and privacy disclosures.
8. Complete Recurrente merchant onboarding and implement payment-link coordination only after approval; the approved future operating rule is manual verification by an authorized administrator before an Order is marked paid. This may proceed in parallel with step 7.
9. Complete security/privacy, concurrency, idempotency, accessibility, E2E, controlled load and recovery testing in non-production first.
10. Execute a separately approved, controlled transactional release after all business, legal/fiscal, privacy, security and operations gates pass.

The Q5 per-received-lot management fee and inbound-shipping collection arrangement are commercially approved, subject to applicable legal review; no fee collection is implemented by the current site. Current Checkout remains a non-transactional in-memory review and WhatsApp inquiry; do not claim purchase Requests, Orders, holds, payment links, payment verification, or FEL are active.

### Chatbot

The preferred future chatbot uses an existing model/service, not a foundation model trained from scratch. Limit its approved domain to REVA, fashion, garments, Catalog, buying, selling, donation, and circular fashion. It may access only explicitly allowlisted public information; it must not receive unrestricted database access, Intake, Profiles, roles, private media, secrets, admin tools, or write capabilities. Plan cost and rate controls, prompt-injection and untrusted-content defenses, topic boundaries, safe failure behavior, and handoff to REVA's configured official contact channel.

### Public UX and Content

- **Priority #1: REVA Experience & Visual Redesign.** Treat UX/UI, responsive behavior, accessibility, security, privacy, and compliance as continuous quality requirements, not a final cleanup phase. Keep pages shorter and more decisive rather than adding sections; remove redundant copy and repeated card patterns; use clear hierarchy, meaningful photography, depth through composition, and purposeful interactions. Do not fabricate Product photos, delivery evidence, partnerships, or operational proof.
- **Brand foundation:** REVA's blue-gray core palette remains the dominant visual foundation across pages. Route cues are subordinate accents, not independent palettes: Comprar uses the existing deep REVA blue (`#3d5a66`, derived from source storm blue), Vender uses muted mauve/plum (`#705b78`), and Donar uses muted corinto (`#78434b`). Apply these selectively to route labels, lines, frames, and small details while preserving shared REVA typography and primary controls.
- **Page-by-page approval process:** audit the real current page and browser composition; identify redundancy and define a stronger customer journey; research relevant patterns; present the proposed direction and material asset needs; obtain approval before significant implementation; implement only that page; validate UX, responsive layouts, accessibility, and performance; obtain visual approval before treating it as frozen. Do not redesign all routes at once.
- When a meaningful asset is important to the result and none is approved, request the specific asset before using a weaker placeholder. Describe the page/section and intended use, subject/composition, style, aspect ratio/resolution, background/transparency, expected interaction/animation, whether it depicts real inventory or editorial fiction, and an optional generation prompt. Keep real Product imagery authoritative and distinguish editorial imagery from real operational evidence.
- Public-page quality checks include mobile-first behavior plus tablet/laptop review, first-viewport hierarchy, overflow, touch targets, keyboard/focus behavior, screen-reader semantics, accessible dialogs/forms, contrast, reduced motion, and honest loading/error states. Target WCAG 2.2 AA where applicable; do not claim conformance or certification without an appropriate audit. See `AGENTS.md` for durable engineering requirements and `SECURITY_PRIVACY.md` for security/privacy evidence expectations.

### Website Compliance & Customer Trust — Permanent Cross-cutting Workstream

This workstream applies across public redesign and future commerce; it is not an additional item that changes the approved eight-step sequence. Maintain a route-aware inventory and resolve content with the business owner and qualified Guatemala-specific legal/fiscal review where appropriate. Do not invent policy or legal claims. `REVA_BUSINESS.md` remains authoritative for approved and unresolved business policy; `SECURITY_PRIVACY.md` owns privacy/security posture and evidence.

- Review public privacy notice, terms, buying/selling/donation policies, returns/cancellations, delivery/shipping, contact details, support expectations, and cookie/tracking disclosures. Mark each as approved/current, partially defined, or blocked for a decision; a page or draft is not evidence that the policy is approved.
- Clarify data purposes, retention/deletion, account/privacy requests, provider disclosures, and any tracking before adding collection or analytics. Keep data collection and disclosures proportionate to actual product behavior.
- Obtain Guatemala-specific legal/fiscal review before making jurisdictional legal claims or enabling relevant transactions. FEL and billing requirements remain matters to verify when applicable, not assumptions or promises.
- Maintain FAQ coverage for general REVA questions, buying, selling, donation, Cart, future Checkout, and account/privacy. Keep authoritative answers in one maintained source; surface contextual questions only where useful and link to fuller help when appropriate. Do not repeat the same FAQ block across every route or imply an unapproved policy.
- Independent Systems Engineering faculty cybersecurity/privacy review, evidence, remediation, and a signed review letter remain mandatory graduation requirements. Treat them as ongoing preparation and a final independent review—not a substitute for security/privacy work throughout development.

#### Contextual commercial terms — local copy aligned, legal/fiscal review remains

The local `/terminos`, `/privacidad`, and `/preguntas-frecuentes` copy and contextual links from relevant journeys are aligned to the latest approved purchase/privacy policies and current application behavior. They remain informational, not legal/fiscal certification or authorization to activate transactional data collection. Qualified Guatemala-specific legal/fiscal review remains required before treating the terms as enforceable or enabling Requests, Orders, payment or FEL. Do not silently turn remaining operational or legal decisions into policy.

- `/donar`: garment acceptance, donation process, limitations, responsibilities, and uncertainty about destination.
- `/vender`: intake conditions, valuation, management fee, selling period, seller proceeds, and unsold-garment options.
- Catalog, PDP, and Cart: unique inventory, garment condition, availability, cancellation, and purchase conditions.
- Future Checkout: delivery, billing, payment, refunds, and applicable Guatemala FEL requirements, after the relevant legal/fiscal review.

Contextual links in this local implementation point to the available draft hub pages and make their limited/current scope clear. Before deployment, review and approve each linked condition; preserve authoritative approved/unresolved decisions in `REVA_BUSINESS.md`.

### REVA Motion & Interaction System — Future

REVA should evolve toward a modern, elegant, interactive fashion-ecommerce experience: original compositions with depth and purposeful interaction, while protecting usability, accessibility, performance, and trust. Future frontend work should begin by defining interaction goals and visual hierarchy, inspecting real browser composition at target breakpoints, identifying compact layouts where quick review matters, and selecting meaningful microanimations. Major UI work should be informed by relevant design references or a prototype before implementation. “Premium” does not mean adding borders, shadows, or colored containers by default. Motion must improve feedback, orientation, continuity, or interaction; respect reduced-motion preferences; and remain maintainable. The page-by-page visual redesign and Motion System are distinct workstreams; a site-wide pass requires its own explicit scope. Sprint 30B/30C refined Cart interactions. The 2026-10-13 Night Side motion side sprint repaired `/como-funciona`'s continuous story line and made selected shared/product-discovery feedback keyboard-equivalent and reduced-motion aware. Its explicitly approved Motion System 2.0 continuation implements route-specific CSS-native movement; see `SPRINTS.md` for scope and evidence.

#### Motion language — initial local vocabulary

Use motion sparingly and consistently: small control/state feedback typically settles within 150–220 ms; spatial UI such as a Drawer uses about 220 ms with a restrained ease-out; editorial image emphasis may use 400–600 ms, with only a slight scale (about 1.015–1.03) or short displacement (about 2–4 px). Route entrances may use one modest 500–600 ms hierarchy with a short stagger; never stagger every paragraph. Prefer transform/opacity for motion, keep color/focus feedback immediate and understandable, and never make content or navigation wait for an animation. Scroll-linked motion is a progressive enhancement over fully visible static content. Reduced-motion preference removes nonessential movement and leaves the full state visible. These are design ranges, not a requirement to animate every control or a new global animation framework.

The approved 2026-10-13 Motion System 2.1 navigation treatment uses a CSS-only 180ms opacity arrival on customer-facing route `<main>` elements and `aria-current="page"` feedback in the shared Navbar. It deliberately does not enable Next.js's experimental React View Transition integration or intercept links: standard App Router navigation remains responsible for history, prefetch, scroll, and streaming. Browsers without CSS animations, and users preferring reduced motion, receive the unchanged fully visible page. This is a restrained incoming cue, not a captured outgoing-page crossfade; revisit native transitions only when the framework integration is stable and compatible without route interception or state resets.

The PDP experience redesign is implemented locally for visual review: it adds an accessible interactive gallery, a subtle deterministic atmosphere from the existing public Product color, and a clarified identity/price/size/condition/Add-to-Cart hierarchy. It preserves published-only data, original photo order, existing Cart and contact behavior, and the deferred 3D milestone. The desktop hover magnifier is explicitly **DEFERRED / NOT WORKING** per developer browser report and must not be reopened during Checkout; other gallery controls and mobile zoom remain preserved. See `SPRINTS.md` and `TO_CONSIDER.md` for status and evidence requirements; this does not alter business policy or authorize transactional Checkout/payments.

### Analytics and Metrics

Analytics follows an approved privacy/domain decision. Candidate future events include page/PDP views, Catalog/filter usage, WhatsApp/Instagram clicks, Cart, chatbot, and later conversion. Introducing analytics requires a privacy/tracking reassessment.

### Operations

- Logs, uptime, backup ownership, Storage recovery, environment recovery, and incident response.

### Faculty Review

- Architecture evidence, data-flow diagram, authorization matrix, RLS/RPC evidence, upload tests, dependency evidence, privacy evidence, safe accounts/fixtures, reviewer checklist, remediation log, final independent review, and signed letter.

## Dependency and Governance Caveats

The preferred order is not permission to activate transactional checkout before Orders, atomic unique-inventory reservation, authoritative prices, and payment verification exist. The approved current `/checkout` is a non-transactional Product review and WhatsApp inquiry only: public Products/prices are revalidated, no customer fields leave browser memory, and no Order, reservation, payment, or invoice is created. Any externally issued payment link remains a later REVA-coordinated step, not an implemented integration. The Orders/reservation phase must precede payment integration and invoice issuance. Provider choice, shipping/return policy, billing rules, FEL requirements, and other unresolved business decisions remain open under `REVA_BUSINESS.md`.

### Official non-transactional Checkout

The official customer journey supports direct single-Product entry from PDP and multi-Product entry from Cart through one `/checkout` route. Public Checkout remains non-transactional: delivery/contact/billing inputs are temporary browser-memory review fields and are not submitted or stored, and the public conversion is an explicit WhatsApp inquiry. A development-gated transactional request/Order backend and manual Recurrente coordination are implemented. The developer reports hosted migrations M017–M024 and production encryption keys configured; these control-plane and database states were not independently verified in this domain QA. Production transactional Checkout remains disabled. Automated payment verification, FEL and real customer-data collection activation remain future gates requiring separate approval.

### Checkout geography map

The interactive Guatemala-department 2.5D map is **DEFERRED, NOT CANCELLED** due to unresolved reuse rights for candidate municipal geometry. The official Checkout works without a map and keeps its text municipality/zone controls. Zone-level zoom must wait for verified licensed polygons. No further map implementation is in scope until an attributable, redistribution-authorized source and accuracy/version evidence are approved.

Security, privacy, and graduation evidence are cross-cutting throughout every workstream. Continue proportionate privacy/security review and address critical security findings when discovered; visual priority never justifies deferring critical remediation. Independent Systems Engineering faculty review, evidence, remediation, and a signed review letter remain graduation requirements, not a final-stage substitute for ongoing secure development.

### Transactional backend — local QA foundation implemented (2026-10-16)

Local-only implementation now covers temporary encrypted requests, admin approval and unique-product reservations, manual Recurrente coordination/verification, fulfillment, retention/cleanup, and late-payment incidents. M017–M024 are applied only to local Supabase. This is not hosted migration approval, production payment readiness, or permission to collect real customer data. Next gates are visual/manual Admin and Checkout QA, production key custody and backup/recovery, trusted abuse controls, operational/legal/FEL approval, hosted migration preflight, and independent security/privacy review. See `SECURITY_PRIVACY.md`, `DATA_ARCH.md`, and `SPRINTS.md`.

Sprint numbers record implementation history in `SPRINTS.md`; this workstream order supersedes the former planned-sequence snapshot but does not rewrite prior Sprint outcomes or itself start the next Sprint.

## Earlier Implementation Milestones

Sprints 27–30C recorded the completed dependency, security, privacy/account, Cart, and Cart usability work in `SPRINTS.md`. These are historical implementation milestones; the approved future preferred order above now governs upcoming strategic sequencing.

## Final Graduation Direction

Privacy and cybersecurity are cross-cutting constraints for every future feature and formal graduation requirements. A final independent Systems Engineering faculty review, documented remediation of any findings, and a signed review letter with reviewer contact information are final gates. The reviewer—not REVA or Codex—determines whether the evidence is satisfactory.

### Transactional backend foundation — local prototype status (2026-10-15)

A local-only implementation now exists for temporary Purchase Requests, atomic admin approval into Orders with three-hour unique-Product reservations, manual fulfillment/payment-status administration, and a development-gated Checkout submission path. Its migration is locally tested only. This does not activate public/production Checkout, authorize real customer-data collection, constitute payment integration, or complete the transactional workstream. Production activation requires security review, stable key custody/recovery, retention and backup/deletion controls, concurrency and end-to-end testing, qualified legal/fiscal review, and explicit operational/provider approvals. Do not run linked migrations as local development.
