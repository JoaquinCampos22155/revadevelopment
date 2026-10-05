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
- The owner can see the actual public selling price in the Catalog once the Product is listed.
- Public explanations may describe valuation generally; no formal valuation formula is approved.
- The selling period is **up to 90 days from physical receipt of the lot**. This is approved operational direction, but contractual wording must be reconfirmed before Terms are published.
- A fixed management fee applies per lot/box.

### Fee and incentive boundaries

- **PARTIALLY DEFINED:** The management fee is fixed per lot/box; its amount and exact public disclosure are unresolved. Do not invent an amount or present hidden-fee language.
- **PARTIALLY DEFINED:** If an entire lot sells, REVA intends to provide an additional incentive/coupon for buying through REVA. It is additional to proceeds. Its value and expiration are not finalized; do not make detailed promotional promises.

### Unsold garments

**APPROVED.** After the selling period, the owner chooses whether an unsold garment is donated or returned.

- If returned, return shipping is paid by the owner, not REVA.
- **PARTIALLY DEFINED:** The communication and logistics process for that decision still needs operational definition.

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

- Initial expected payment: bank transfer.
- **FUTURE / NOT MVP:** Payment links may be added later.
- Initial buyer delivery: shipping/courier in Guatemala City.
- **BLOCKED / REQUIRES DECISION:** Buyer shipping-cost policy, including the circumstances in which it depends on purchase amount.
- **BLOCKED / REQUIRES DECISION:** Returns/exchanges policy. Do not state a no-return policy, return window, refund process, or defect guarantee.
- **APPROVED:** No reservation model exists for MVP.

### Future selection / conversion

**FUTURE / NOT MVP.** REVA wants to evaluate a lightweight selection/cart experience without checkout:

```text
Product Detail
→ add to selection
→ continue browsing
→ selection/cart
→ contact REVA about selected garments
→ WhatsApp and/or Instagram
```

This is not authorization to expose internal data. SKU is currently internal/non-public. A future conversion design must use public title/canonical URL or an explicitly approved safe public identifier, and must research current WhatsApp/Instagram message-prefill capabilities before implementation. No checkout, payment gateway, WhatsApp Business API, or Instagram DM integration is currently approved.

## Public Geography and Contact

- **APPROVED:** Initial public operating coverage is Guatemala City / Guatemala; do not imply nationwide coverage.
- **BLOCKED / REQUIRES DECISION:** Exact public contact channels and their configured destinations.
- **FUTURE / NOT MVP:** A product-specific customer-contact conversion path may be added after research and approval.

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

**APPROVED.** Provide concise, route-specific FAQs for the relevant journey first (Cómo funciona, Vender, Donar, buying/Product Detail). A central FAQ hub may be added later if enough distinct content justifies it. Do not duplicate the same answer across every route.

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
| `/vender` | Explain the selling journey without inventing fees, logistics, settlement, or contractual policy. |
| `/donar` | Explain donation as a distinct journey without promising recipients, benefits, logistics, or guaranteed outcomes. |
| `/nosotros` | Future real founder/community story once factual assets and biographies are approved. |
| Footer / contact | Secondary general navigation/contact only when an actual channel is configured. |

## Decisions Still Required

The following remain unresolved and must not be silently converted into public policy or copy:

1. Management-fee amount and disclosure presentation.
2. Full-lot-sale incentive/coupon amount and expiration.
3. Buyer shipping-cost policy.
4. Returns/exchanges policy.
5. Donation campaign/volume trigger, logistics, and recipient process.
6. Textile recycling/reuse partner and verified handling process.
7. Exact public contact channels and destinations.
8. Payment-link provider and payment-flow design.
9. Selection/cart conversion model, including safe public product identifiers and WhatsApp/Instagram capabilities.
10. Contractual Terms wording, including confirmation of the 90-day period.
11. Privacy, cookie, and storage-policy requirements after a technical/legal audit.
12. Founder names, roles, biographies, approved team photography, and real origin-story details.
13. Verified environmental facts and any Guatemala/Río Las Vacas claim.

## Implementation Guardrails

Before implementing business-facing work, distinguish an approved REVA fact from a partially defined direction, external research, and an unresolved decision. Do not fill gaps with industry defaults, generic ecommerce assumptions, or invented promises. When a public policy is blocked, prefer truthful high-level language or omission.
