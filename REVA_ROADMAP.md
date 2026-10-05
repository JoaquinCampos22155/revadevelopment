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

REVA has a public MVP deployed on Render with a Supabase backend, public Catalog and PDPs, Product Manager, curated recommendations, and real inventory. Migrations M001–M016 are part of the implemented architecture. The current production deployment does not replace the planned custom-domain workstream.

The following capabilities do **not** currently exist: Cart, Orders, native Checkout, payment integration, chatbot, or analytics. Their absence is intentional; no statement in this roadmap approves implementation by itself.

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

- Final domain, Render configuration, `REVA_SITE_URL`, Supabase Auth URLs, canonical/SEO settings, privacy documentation, and marketing/QR links.

### Cart / Selection

The likely first architecture is an anonymous local selection using only public Product identity/slugs. Quantity is one, there is no reservation initially, and availability must be revalidated from the public Product projection. It must remain compatible with future checkout; Cart does not itself approve Checkout.

### Checkout

Checkout is separate from Cart and is not approved as native functionality. It eventually requires an Order model, unique-inventory reservation/concurrency rules, customer/contact requirements, delivery, refund/cancellation policy, and a payment integration decision.

### Payments

The final payment provider/mechanism remains deliberately unresolved and externally dependent. Future options may include a payment gateway, CyberSource, Paggo, a local acquiring solution, payment links, bank transfer, or another approved Guatemala-appropriate mechanism. Do not design as though Stripe or any provider has been selected.

### Chatbot

The recommended initial scope is a FAQ/business assistant. It may later use approved public Product data, but it must not receive raw database access, Intake, Profiles, roles, private media, secrets, or admin tools.

### Public UX and Content

- Remove demonstrated redundancy, refine Catalog, improve PDP gallery, Contact/Footer, policy links, and accessibility.
- Preserve frozen pages unless evidence and explicit scope justify a change.

### Analytics and Metrics

Analytics follows an approved privacy/domain decision. Candidate future events include page/PDP views, Catalog/filter usage, WhatsApp/Instagram clicks, Cart, chatbot, and later conversion. Introducing analytics requires a privacy/tracking reassessment.

### Operations

- Logs, uptime, backup ownership, Storage recovery, environment recovery, and incident response.

### Faculty Review

- Architecture evidence, data-flow diagram, authorization matrix, RLS/RPC evidence, upload tests, dependency evidence, privacy evidence, safe accounts/fixtures, reviewer checklist, remediation log, final independent review, and signed letter.

## Dependency Relationships

```text
SECURITY/PRIVACY FOUNDATION
         ↓
USER/ACCOUNT FOUNDATION
         ↓
PRODUCT FEATURES
     ↙          ↘
  CART        CHATBOT
     ↓
CHECKOUT ARCHITECTURE
     ↓
PAYMENT MECHANISM

SECURITY REMEDIATION
     ↓
CUSTOM DOMAIN
     ↓
ANALYTICS

ALL FINAL FEATURES
     ↓
FINAL SECURITY/PRIVACY AUDIT
     ↓
FACULTY REVIEW
     ↓
REMEDIATION
     ↓
SIGNED REVIEW
```

These relationships guide sequencing, not a claim that every workstream must wait for all earlier work. Independent evidence-led work may progress when its own prerequisites are met.

## Current Planned Sequence

The next planned work is intentionally prioritized as follows:

1. **Sprint 27 — dependency security remediation.**
2. **Sprint 28 — security hardening baseline.**
3. **Sprint 29 — privacy, account, and retention foundation.**

Later Sprint numbers are planning labels, not immutable commitments. They may evolve as evidence, business decisions, or approved architecture changes.

## Final Graduation Direction

Privacy and cybersecurity are cross-cutting constraints for every future feature and formal graduation requirements. A final independent Systems Engineering faculty review, documented remediation of any findings, and a signed review letter with reviewer contact information are final gates. The reviewer—not REVA or Codex—determines whether the evidence is satisfactory.
