# REVA Business and Public Content Source of Truth

## Purpose and Authority

This document is REVA's durable source of truth for approved business rules, public-content boundaries, customer journeys, and decisions that remain unresolved. Read it before implementing or modifying public content, conversion, selling, donation, FAQs, SEO, policies, public Product/customer journeys, or business-facing copy.

It complements rather than replaces other project documents:

- `AGENTS.md` owns durable engineering rules.
- `DATA_ARCH.md` owns data, security, storage, and technical architecture.
- `REVA_ROADMAP.md` owns persistent strategic workstreams and sequencing dependencies.
- `SECURITY_PRIVACY.md` owns privacy/security posture and evidence expectations.
- `SPRINTS.md` owns development history and milestone state.
- `TO_CONSIDER.md` owns deferred work and pending decisions.

Status labels used here:

- **APPROVED** — may guide truthful implementation and copy within its stated boundary.
- **PARTIALLY DEFINED** — direction is approved, but details must not be invented.
- **BLOCKED / REQUIRES DECISION** — do not publish a rule, promise, or policy until defined.
- **FUTURE / NOT MVP** — intentional future direction, not current functionality or public promise.

## What REVA Is

**APPROVED.** REVA is an integrated circular-fashion service that helps people decide what to do with clothing they no longer use without requiring them to individually manage selling or donation one piece at a time.

REVA is not only a second-hand store. It receives a collection of garments, performs the operational work of reviewing, classifying, valuing, photographing, publishing, and attempting to sell eligible pieces, while also supporting donation as a distinct path. It seeks to make second-hand buying and selling easier, extend the useful circulation of garments, reduce textile waste, and build a community around a more conscious relationship with clothing.

The public tone is optimistic, human, community-oriented, and trustworthy; never guilt-driven or artificially corporate.

## Value Proposition and Integrated Model

**APPROVED.** The natural intake unit is usually multiple garments: a lot, box, or accumulated clothing from a closet. A lot must contain at least **15 garments**. REVA removes the friction, risk, and time of informal individual resale.

```text
Person has clothing they no longer use
→ provides a lot / box to REVA
→ REVA physically reviews and classifies garments
→ REVA values eligible garments
→ REVA photographs the actual sellable garments
→ REVA publishes and attempts to sell them
→ the owner receives the applicable proceeds when a garment sells
```

The central public idea may be expressed truthfully as: **“Tú decides qué hacer con la ropa que ya no usas. REVA se encarga del resto.”** Copy may adapt this idea without overstating unfinished policy.

## Selling Journey

### Approved operating flow

**APPROVED.**

```text
Owner provides a lot / box
→ REVA physically receives and reviews it
→ REVA classifies and values eligible garments
→ owner receives an approximate expected amount for each eligible garment
→ REVA photographs and publishes eligible garments
→ REVA attempts to sell them for up to 90 days from physical receipt of the lot
→ owner receives their corresponding share immediately after each garment sale
```

- REVA determines public sale price using factors such as brand, condition, garment characteristics/type, and market context.
- **APPROVED (2026-10-15):** The reference share of each garment's sale price is 65% for the owner and 35% for REVA. A separate fixed lot-management fee of Q5 per received lot applies and is charged together with the cost of shipping the lot to REVA. It covers reception, review, photography, and publication. The fee is not refunded for work already performed, subject to applicable legal rights. This percentage is not a complete seller contract or a promise about the payment method or operational processing time.
- The owner can see the actual public selling price in the Catalog once the Product is listed.
- Public explanations may describe valuation generally; no formal valuation formula is approved.
- The selling period is **up to 90 days from physical receipt of the lot**. This is the approved operating start point; the older private master draft's alternative start at valuation acceptance is superseded for current public explanation.
- A fixed management fee applies per lot/box.

### Fee and incentive boundaries

- **APPROVED (2026-10-15):** Q5 fixed management fee per received lot, charged together with inbound shipping to REVA. It is separate from return shipping, REVA's 65/35 sale-price split, and any payment-processing cost. It covers intake, review, photography, and publication; its non-refund treatment for work already performed remains subject to applicable legal rights and qualified review.
- **PARTIALLY DEFINED:** If an entire lot sells, REVA intends to provide an additional incentive/coupon for buying through REVA. It is additional to proceeds. Its value and expiration are not finalized; do not make detailed promotional promises.

### Unsold garments

**APPROVED.** After the selling period, the owner chooses whether an unsold garment is donated or returned.

- If returned, return shipping is paid by the owner, not REVA.
- **PARTIALLY DEFINED:** The communication and logistics process for that decision still needs operational definition.
- **APPROVED RULES, SUBJECT TO LEGAL REVIEW:** Early withdrawal has a Q10 charge per garment withdrawn plus return shipping; already-sold garments cannot be withdrawn. After the selling period, REVA gives notice and contemplates an additional 10-day response period. Disposition of unclaimed garments requires the owner's prior express authorization. Do not imply REVA may dispose of garments without that authorization.

## Donation Journey

**APPROVED.** Donation is a distinct decision available from the beginning; selling first is not required.

```text
Person provides garments for donation
→ REVA receives and reviews them
→ garments are accumulated/stored
→ sufficient volume or an appropriate campaign/hand-off opportunity is reached
→ donation is distributed to organizations, communities, or individuals as appropriate
```

- REVA intends to publish ethical, privacy-safe evidence of future donation deliveries for transparency.
- **APPROVED:** Donation has no guaranteed material benefit in the MVP.
- **FUTURE / NOT MVP:** A donation coupon may be considered later, but is not a current promise.
- **BLOCKED / REQUIRES DECISION:** Exact volume trigger, campaign trigger, recipients, logistics, and public contact mechanism.

## Garments That Cannot Enter Resale

**APPROVED.** REVA's integrated-service intent is not to simply reject every garment that is unsuitable for resale. Heavily damaged or stained garments may be received for donation or future alternative handling, but they are not automatically sellable Products.

**FUTURE / NOT MVP:** REVA intends to seek a textile-recycling or textile-reuse partner for garments that cannot continue through resale or donation.

**Non-negotiable public-content rule:** Do **not** claim that REVA already recycles textiles, has a recycling partner, or guarantees a recycling outcome. Safe language may state that REVA is working to expand alternatives for garments that cannot continue through resale or donation.

## Acceptance Boundaries

| Category | Current rule |
| --- | --- |
| Women, men, children | **APPROVED:** REVA serves all three conceptually. Children discovery may remain unavailable/“Próximamente” until meaningful inventory exists. |
| Used underwear | **APPROVED:** Not accepted. |
| Shoes | **APPROVED:** Not part of the MVP acceptance scope. |
| Accessories, bags, caps, etc. | **APPROVED:** Not part of the MVP acceptance scope. |
| Brands | **APPROVED:** No blanket brand restriction; garment condition and characteristics matter more. |
| Damaged/stained garments | **APPROVED:** May be received within the integrated service for donation or future alternative handling; not guaranteed resale. |

## Product Truth, Uniqueness, and Review

**APPROVED.** Every sellable Product is one unique physical piece. There is no public quantity/variant substitute for that physical garment.

- Catalog and Product Detail photography must depict the exact garment held by REVA and offered to the buyer.
- Product photography and editorial/brand photography are different. Editorial images may depict community, clothing, or REVA's work and must not imply that they represent current Catalog inventory.
- REVA physically reviews garments, considering relevant factors such as condition, stains, damage, size, and other characteristics.
- Truthful public phrasing includes **“revisadas y seleccionadas.”** This is not a guarantee, authentication certificate, or inspection warranty.

## Product Condition

**APPROVED.** The internal/domain condition scale and its customer-facing labels are:

| Internal value | Customer-facing condition |
| --- | --- |
| `4` | Nuevo con etiqueta |
| `3` | Como nuevo |
| `2` | Buen estado |
| `1` | Con detalles |

Condition describes the garment; it is not a review, quality score, customer rating, or star rating.

**Non-negotiable rule:** Never display stars, star icons, rating widgets, review semantics, `aggregateRating`, `ratingValue`, or equivalent structured-data semantics for condition. Public surfaces should use clear textual labels such as “Condición: Buen estado.”

## Buyer Journey

### Current MVP direction

**APPROVED.** Buyers discover real published Products through Catalog and Product Detail. Products are unique and are allocated to the first completed payment when there is competing interest. REVA should communicate competing interest where applicable.

- **APPROVED FUTURE COMMERCIAL FLOW (2026-10-15; implementation and detailed schema still gated):** `Temporary Purchase Request → Admin Approval → Confirmed Order → Payment Coordination → Verified Payment → Fulfillment`. Each explicitly submitted temporary request is non-reserving and expires exactly 24 hours after its server-recorded `created_at` (`expires_at = created_at + 24 hours`); there is no global cutoff or automatic extension. Expired requests cannot be approved. Expired or discarded requests and their associated personal data must be deleted completely from operational stores, with no request-derived marketing metrics retained; infrastructure backup limitations and deletion behavior must be documented and tested before collection. Admin approval revalidates availability and authoritative prices, then in one atomic operation reserves the unique garments for three hours and creates/promotes an Order pending payment. Approval is not payment confirmation. An authorized administrator manually verifies payment in Recurrente before marking the Order paid. Approved unpaid Orders retain the source request's original 24-hour deadline; at that deadline delete the Order and associated operational data unless payment is verified or a documented financial incident remains unresolved. The three-hour reservation expiry releases inventory but does not shorten that data deadline. Retain verified-paid or incident records only under a separate legally supported retention schedule. This flow remains disabled for real customers. Opening PDP, Cart, or Checkout creates no request or hold. Do not collect customer data until privacy/security controls, backup/deletion evidence, legal/fiscal requirements, and operational handling are ready.
- Initial buyer delivery: shipping/courier in Guatemala City.
- **BLOCKED / REQUIRES DECISION:** Buyer shipping-cost policy, including the circumstances in which it depends on purchase amount.
- **APPROVED CUSTOMER POLICY (2026-10-15):** A customer may cancel before REVA confirms dispatch and request an address change before dispatch, subject to coverage and possible cost adjustment. No general return applies to change of mind, without excluding applicable consumer rights. REVA reviews claims for a wrong garment or significant undisclosed defect. Prompt reporting with photographs/opening video is recommended but is not an absolute condition that extinguishes rights. Internal credit is the usual commercial remedy; other solutions may apply based on circumstances and legal rights. For an accepted return, REVA determines whether to collect the garment or cover return shipping according to the case. This wording is approved business policy, not legal certification.
- **APPROVED:** No reservation model exists for MVP.

### Selection / current purchase inquiry

**APPROVED — official non-transactional Checkout.** REVA provides an anonymous local selection and a public Product review/contact flow:

```text
Product Detail → Comprar → Checkout (one Product)
or
Catalog → add to selection → selection/cart → Checkout (selected Products)
→ current public Product/price revalidation
→ WhatsApp purchase inquiry
→ REVA coordination and, if appropriate, an externally issued payment link
```

The browser Cart stores only safe public Product slugs and does not reserve garments. Opening Checkout resolves current published Products through the public projection; the final WhatsApp inquiry performs another server-side availability/price read. The inquiry contains only public Product titles, current prices, canonical Product URLs, merchandise subtotal, and a note that delivery remains unconfirmed. The form's contact, delivery, and billing fields remain temporary in-memory review data: they are not submitted to REVA, persisted, or included in WhatsApp. SKU remains internal/non-public. This current journey is not an Order, reservation, confirmed purchase, payment, or invoice. The future 2026-10-15 lifecycle and 24-hour request rules are approved business direction only; no request persistence, Order, reservation, payment verification, provider integration, or FEL sequence is implemented or authorized. Instagram is not used for prefilled multi-Product purchase messaging.

## Public Geography and Contact

- **APPROVED:** Initial public operating coverage is Guatemala City / Guatemala; do not imply nationwide coverage.
- **APPROVED (2026-10-23):** Public contact channels for `/contacto`: `informacionreva@revagt.com` by email; WhatsApp through the configured `REVA_WHATSAPP_NUMBER`; and the official Instagram account `@shopwithrevagt` as a secondary channel. Cloudflare Email Routing forwards incoming messages; this does not establish an outbound email service or response-time commitment. WhatsApp is the primary general contact action; email and Instagram are accessible alternatives. Do not expose internal configuration or invent business hours, response times, addresses, or support guarantees.
- **APPROVED:** The official REVA TikTok account is `@revagt26`; it may be linked as a social-follow destination. This does not change the `/contacto` channel hierarchy or authorize additional claims about support or response times.
- **RESOLVED (2026-10-23):** Public contact now uses `informacionreva@revagt.com` through Cloudflare Email Routing for incoming email. Do not imply that routing itself provides outbound email delivery.
- **BLOCKED / REQUIRES DECISION:** Contact-response ownership and process, including any response-time expectation. Do not publish a response-time promise until approved.

## REVA Story and Community

**APPROVED.** REVA was born in Guatemala and is built by three friends/founders who want to normalize buying and selling second-hand clothing and build a community around a different relationship with garments.

- The voice should be human: friends building something they believe in, not generic corporate-founder language.
- `/nosotros` is an intended future real institutional route with real founder/team photography, names, roles, mini bios, and an authentic origin story.
- Do not state that REVA originated at Universidad del Valle de Guatemala.
- Do not fabricate founder identities, biographies, team photographs, history, or social links.

## Environmental Communication

**APPROVED.** Environmental awareness is central to REVA. Public communication should be educational, optimistic, and community-oriented rather than guilt-driven.

- `/como-funciona` should eventually include an “El problema que queremos cambiar” responsibility.
- External environmental facts, statistics, and Guatemala-specific claims may be used only when verified with credible sources and cited appropriately.
- Do not publish the Río Las Vacas example unless reliable evidence directly supports the intended textile-waste claim.
- Do not turn general circular-fashion facts into REVA-specific performance claims.

## Public Language, SEO, and FAQs

### Language

**APPROVED.** Public Spanish uses **tú**, not vos. Use natural, non-stigmatizing language that combines editorial tone with authentic search language:

- ropa de segunda mano
- prendas de segunda mano
- moda circular
- prendas con historia
- ropa usada (strategically and naturally)
- comprar segunda mano
- vender ropa usada
- donar ropa

Use Guatemala/Ciudad de Guatemala naturally only where coverage supports it. Avoid keyword stuffing.

### FAQ strategy

**APPROVED.** Provide concise, route-specific FAQs for the relevant journey first (Cómo funciona, Vender, Donar, buying/Product Detail), alongside the developer-approved central `/preguntas-frecuentes` hub. Do not duplicate the same answer across every route.

## Frozen Home Information Architecture

**APPROVED.** Current Home responsibility and section order are intentionally constrained:

```text
Hero
→ Recomendado por REVA
→ Descubre a tu manera
→ Participa en REVA
→ concise trust/value statement
→ Footer
```

Home orients visitors, creates interest, exposes real curated inventory, and routes visitors to the correct journey. It must not become a full policy, FAQ, selling-process, donation-process, or company-history page. No additional Home sections should be added during content planning without a separate approved decision.

## Public Route Responsibilities

| Route/surface | Approved responsibility |
| --- | --- |
| `/` | Orientation, curated discovery, and entry to relevant journeys. |
| `/catalogo` | Browse/filter real published inventory. |
| `/productos/[slug]` | Evaluate one real Product; future interest conversion must use a safe public contract. |
| `/como-funciona` | Explain REVA's model, trust, community, and approved environmental context at a high level. |
| `/vender` | Explain the selling journey, 65%/35% reference share, approved Q5 management fee and its relation to inbound shipping, and seller choices without inventing a shipping price or final legal contract terms. |
| `/donar` | Explain donation as a distinct journey, including possible resale where appropriate, without promising recipients, benefits, logistics, or guaranteed outcomes. |
| `/nosotros` | Future real founder/community story once factual assets and biographies are approved. |
| Footer / contact | Secondary general navigation/contact only when an actual channel is configured. |

## Decisions Still Required

The following remain unresolved and must not be silently converted into public policy or copy:

1. Full-lot-sale incentive/coupon amount and expiration.
2. Buyer shipping-cost policy, serviceability details, and delivery timing; no universal fee, free-shipping threshold, or guarantee is approved.
3. Seller payment method and operational processing details; obtain qualified Guatemala legal review of seller, unclaimed-garment, and non-refund wording before relying on it as an enforceable contract.
4. Donation campaign/volume trigger, logistics, and recipient process.
5. Textile recycling/reuse partner and verified handling process.
6. Contact-response ownership and process, including any response-time expectation; the current public email, configured WhatsApp, and official Instagram are approved for `/contacto`.
7. Detailed schema/security ADR and implementation; implement and test the approved three-hour hold on admin approval, release/recovery, late-payment and cancellation/refund handling. Recurrente is approved for authorized-admin manual payment verification in the future flow, but onboarding, payment links, current terms/fees, tax/rounding/refunds, and FEL/payment sequencing still require validation. No implementation or customer-data collection is authorized by this business direction alone.
8. Selection/cart conversion model, including safe public product identifiers and WhatsApp/Instagram capabilities.
9. Privacy, cookie, and storage-policy implementation/evidence after a technical/legal audit.
10. Founder names, roles, biographies, approved team photography, and real origin-story details.
11. Verified environmental facts and any Guatemala/Río Las Vacas claim.
12. Exact retention periods for records that must be preserved under applicable commercial/fiscal obligations, backup recovery lifecycle and deletion evidence; define before personal-data collection. Expired/discarded request records and associated data are to be deleted, not retained for marketing metrics.

## Master content reconciliation — 2026-10-09 (historical snapshot; later decisions supersede where noted)

The supplied `REVA_DOCUMENTO_MAESTRO_WEB.md` is preserved as a private, ignored reference. Its customer-facing facts were compared with the current product, this business source of truth, the security/privacy baseline, architecture, roadmap, and Sprint history. The following status governs this local content integration; it does not finalize commercial contracts or legal review.

| Topic | Current disposition |
| --- | --- |
| Seller share | 65% owner / 35% REVA and Q5 per received lot plus inbound shipping are approved business terms for public explanation, subject to applicable rights and qualified legal review; seller settlement method/operational details remain to be disclosed before intake. |
| 15-garment lot, physical review, valuation, up-to-90-day operating period, return shipping for unsold garments | Retain current `REVA_BUSINESS.md` wording. The period starts at physical receipt in the approved operating flow; contractual wording remains under review. |
| Start of 90-day period | **Resolved for current business policy (2026-10-15):** the period is up to 90 days from physical receipt; older private-master alternatives are superseded for public explanation. Legal review remains. |
| Seller settlement | **Resolved as business direction (2026-10-15):** the owner's share is assigned after each garment sells. The payment method and operational details must be disclosed before intake; qualified legal review remains. |
| Early withdrawal and unclaimed garments | Q10 per garment for early withdrawal, owner-paid return shipping, a notice plus 10-day response period, and no disposition absent prior express authorization are approved business rules; legal review of contract enforceability and applicable rights remains. Loss/damage compensation and seller-rejection outcomes remain undefined. |
| Buying policies and current state | Approved customer terms cover cancellation before dispatch confirmation, pre-dispatch address changes subject to coverage/cost, change-of-mind returns, wrong/defective garment claims, usual internal-credit remedy and case-specific accepted-return handling. Current Cart/Checkout remain non-transactional and do not reserve, create Orders or process payments. |
| Shipping | Current operating coverage is Guatemala City. Buyer shipping price/promotion and detailed delivery/claim process remain unapproved; no free-shipping offer is published. |
| Donation and Drops | Donation is a distinct route; lots are reviewed and accumulated. Donated pieces may be resold where appropriate, but direct recipient, final routing/consent language, capacity, Drop schedule, and logistics need confirmation. No specific beneficiary or recycling program is promised. |
| Accounts and privacy | Describe current Auth, minimal profile, local Cart references, Checkout's transient in-memory review fields, and provider processing. Checkout fields are not submitted/persisted. Privacy requests for access, correction, deletion, and inquiries may be sent to the approved provisional public email or official WhatsApp; verify identity/authority before disclosure or change. No automatic account deletion or response-time commitment is implemented. Do not promise indefinite retention; retain records as justified and preserve legally required commercial/fiscal records. |
| Founder count | **Conflict:** master describes four founders in one section; the existing approved business source says three. Do not publish a count or replace the current source without explicit reconciliation. |

## Final policy alignment — 2026-10-15

The developer's latest explicit decisions supersede conflicting earlier proposals in the private content master and dated planning notes: Q5 is the fixed management fee per received seller lot, charged with inbound shipping to REVA; the approved operating flow's 90-day period begins at physical receipt, and the owner's share is assigned after each garment sells. The Q10-per-garment early-withdrawal charge, owner-paid return shipping, additional 10-day notice/response period, and prior express authorization before disposition of unclaimed garments are retained. The fee is distinct from shipping and the 65/35 proceeds split; its treatment for work already performed remains subject to applicable rights. The payment method and operational processing details, and qualified legal review, remain necessary before these terms are treated as a final enforceable contract.

The local `/terminos`, `/privacidad`, and `/preguntas-frecuentes` copy and contextual `/vender` content are aligned with these decisions and current implementation. Their presence is not legal or fiscal certification or authorization to activate customer-data collection. Current Checkout fields remain browser-memory-only; REVA receives no submitted address/billing data and creates no requests, Orders, reservations, payments, or invoices. The future administrator workflow will manually verify payment through Recurrente; no integration, payment link, merchant onboarding, or fee is currently active or verified.

These distinctions should be maintained across `/terminos`, `/privacidad`, `/preguntas-frecuentes`, `/como-funciona`, `/vender`, `/donar`, and Catalog links. This matrix supplements—not rewrites—historical Sprint records.

## Final purchase and privacy policy approval — 2026-10-15

The approved buyer policy permits cancellation before REVA confirms dispatch and requests to change the delivery address before dispatch, subject to coverage and any disclosed cost adjustment. REVA does not offer general returns for change of mind, without excluding applicable consumer rights. REVA reviews wrong-garment and significant-undisclosed-defect claims. Prompt notice and photographs/opening video are recommended evidence, never an absolute prerequisite that extinguishes rights. Internal credit is the usual commercial remedy; other case-appropriate solutions may apply under the circumstances and applicable rights. For an accepted return REVA determines, case by case, whether to collect the garment or cover return shipping. Do not invent refund deadlines, delivery guarantees, or blanket statutory-rights exclusions. Qualified Guatemalan legal/fiscal review remains outstanding; this approval is not legal certification.

Privacy inquiries and requests for access, correction, or deletion may be submitted through the approved public email `informacionreva@revagt.com` or the configured official REVA WhatsApp channel. Verify identity and authority appropriately before disclosing or changing personal information. Cloudflare Email Routing forwards incoming messages and does not establish an outbound delivery service. No response-time or automatic account-deletion promise is made. REVA does not sell personal information or share it with third parties for their independent marketing. Necessary providers may process only information needed for legitimate operational purposes, with appropriate safeguards and transparent disclosure. Marketing authorization is optional and separate from purchase processing. Do not promise indefinite retention; preserve commercial/fiscal records only when and for the period applicable obligations require.

The approved future temporary-request flow expires each request 24 hours after server-recorded creation, without extension or inventory reservation. Expired requests cannot be approved. Expired/discarded requests and associated data must be deleted, with no request-derived marketing metrics retained. The future admin approval must atomically reserve unique garments for three hours and create/promote an Order pending payment. An authorized administrator manually verifies payment in Recurrente before marking the Order paid. These remain future capabilities; none is implemented. Document backup lifecycle limitations and deletion/recovery behavior before collecting personal data. See `SECURITY_PRIVACY.md`, `DATA_ARCH.md`, `REVA_ROADMAP.md`, `TO_CONSIDER.md`, and the latest policy addendum in `SPRINTS.md`.

## Implementation Guardrails

Before implementing business-facing work, distinguish an approved REVA fact from a partially defined direction, external research, and an unresolved decision. Do not fill gaps with industry defaults, generic ecommerce assumptions, or invented promises. When a public policy is blocked, prefer truthful high-level language or omission.
