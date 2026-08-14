# REVA Engineering Constitution

## 1. Constitution Purpose and Authority

AGENTS.md is REVA's permanent engineering constitution. It defines durable constraints for how REVA is designed, built, changed, and maintained.

It is not a roadmap, backlog, Sprint log, implementation status report, or prompt template. It contains no temporary decisions, provider configuration, package versions, or historical notes.

Within the project, AGENTS.md is Level 3 authority. A request that conflicts with it requires explicit clarification or an approved constitutional change before implementation. A constitutional rule must remain meaningful regardless of the current feature set or infrastructure provider.

## 2. REVA Product Invariants

REVA exists to make circular fashion simple, accessible, desirable, and trustworthy. Engineering decisions must reinforce circularity, trust, accessibility, community, exploration, sustainability, and simplicity.

REVA is a discovery-first fashion platform. Public visitors must be able to understand the product, explore meaningful content, and discover products without being forced to authenticate.

The platform must reduce uncertainty around second-hand fashion through transparent information, professional presentation, and clear next steps.

The purchase-conversation transition uses the Configured Official Contact Channel. The communication provider is an implementation detail and must not shape domain models, public architecture, or business rules.

Technology serves the product mission. A technically sophisticated solution is not justified unless it improves user value, trust, resilience, or maintainability.

## 3. Engineering Principles

### Research First

Before implementing any non-trivial solution, follow this order:

Research → Reason → Implement.

Research current, authoritative best practices before making decisions involving architecture, UX, SEO, backend systems, storage, authentication, dependencies, or performance. Then explain the reasoning and relevant trade-offs before implementation.

Never implement first and justify later. When research cannot resolve a material decision, stop and request direction.

### Simplicity and Maintainability

Choose the simplest solution that satisfies the real requirement. Prefer clear ownership, explicit boundaries, composition, and readable code over cleverness, premature abstraction, or speculative scalability.

Optimize for a future engineer understanding and safely changing the system, not for minimizing the number of lines written today.

### Reuse With Purpose

Reuse existing behavior when it preserves clarity. Extract shared abstractions only when the shared responsibility is real and stable. Do not create generic components, hooks, services, or utilities merely because future reuse is possible.

### Performance, Accessibility, and SEO Are Product Requirements

Performance, accessibility, and search visibility are considered during design and implementation, not deferred as cleanup. No decorative effect, dependency, or architectural shortcut may knowingly compromise them without explicit approval.

### Progressive Evolution

Build the smallest coherent version of a capability. Preserve clear seams for future evolution without implementing future product scope early.

## 4. Architecture Boundaries

REVA separates presentation, application behavior, domain rules, infrastructure, and persistence.

- Presentation renders user-facing routes and components.
- Application behavior coordinates use cases and data access through defined services or server-side boundaries.
- Domain rules describe REVA concepts and must not depend on a UI framework or infrastructure SDK.
- Infrastructure integrates providers such as databases, storage, analytics, messaging, and AI.
- Persistence stores business data and enforces integrity and access policy.

UI components must not directly access databases, storage providers, privileged APIs, provider administration clients, or secrets.

Use Server Components by default. Create Client Components only when browser APIs, client-side interactive state, or event-driven behavior genuinely require them. Keep client boundaries small and never pass privileged capabilities or secrets across them.

Do not require every read to pass through a hook. Hooks are for reusable client-side behavior; server-side reads and writes should use the appropriate application or server boundary.

Server-only execution does not imply privileged execution. Ordinary request-scoped services and repositories must preserve the caller's authorization context rather than bypassing provider or persistence controls because code runs on a trusted server.

## 5. Module and Folder Governance

`src/app` owns routing, route composition, route metadata, loading states, error boundaries, and route-level concerns. It must not own reusable business logic or provider-specific data access.

`src/components` contains shared presentation primitives and layouts that are independent of a single feature. Shared components must not import feature-specific behavior.

`src/features/<feature>` owns feature-specific components, hooks, services, types, and constants. Features should expose only the smallest stable surface needed by other modules.

`src/types` contains cross-feature domain contracts. Private component props and feature-local contracts should remain close to their owner.

`src/content` contains reusable, localized, frequently edited, or structured static content. Route-local copy may remain colocated with its route when moving it would reduce clarity.

`src/assets` contains source-controlled static assets used by the application. Provider-hosted media follows the storage and asset policy.

Create folders and files only when they have a clear responsibility. Do not scaffold empty architectural layers. Before adding a file, verify that an existing module cannot be extended more clearly.

## 6. Dependency Governance

Evaluate native browser APIs, the framework, and existing internal code before adding a dependency. External libraries are encouraged when they solve a complex, well-established problem materially better than a custom implementation.

Before recommending a dependency, document:

- The problem it solves.
- Why existing platform capabilities are insufficient.
- Alternatives considered.
- Bundle and runtime impact.
- Accessibility, SEO, and performance impact.
- Community adoption and maintenance health.
- Long-term ownership and removal considerations.

Never install, replace, or remove a dependency without explicit developer approval. Approved dependencies must have a focused purpose and must not create unnecessary coupling.

Technology choices and package versions belong in the package manifest, README, and approved architecture records, not in this constitution.

## 7. Data, Provider, and Service Independence

Supabase is an approved infrastructure provider, not a domain dependency. REVA's business rules, domain contracts, and service interfaces must remain understandable and valid without Supabase.

REVA owns its business data and domain models. Providers implement infrastructure capabilities; they do not define the business architecture.

Services and infrastructure adapters are the boundaries for provider integration. Provider SDK types, query formats, URLs, and provider-specific errors must not leak into presentation or domain contracts.

Provider changes must be possible without redesigning public routes, reusable UI, or the business model. Replacing a provider may require an approved migration, but it must not require reinterpreting REVA's domain concepts.

Privileged provider credentials may exist only inside explicitly privileged infrastructure modules for approved infrastructure operations. They must never become the default data-access mechanism for ordinary request-scoped repositories or services.

## 8. Storage, Assets, and Image Delivery

Business data references storage keys or other provider-neutral asset identifiers. Delivery URLs, transformations, signatures, CDN behavior, and cache policy are infrastructure concerns resolved at the delivery boundary.

Assets must be replaceable without requiring presentation-layout changes. Product, collection, brand, user, document, and generated media require explicit ownership and access policy before storage is introduced.

Public media may be publicly deliverable only when its exposure is intentional. Private media must use access-controlled delivery. Sensitive documents and user uploads must never inherit public access by convenience.

Images must have meaningful alternative text when informative, responsive delivery appropriate to their context, and performance-aware loading behavior. Asset naming and bucket conventions belong in the Data Architecture document.

## 9. Authentication, Authorization, and Privacy

Authentication must unlock value, never block public discovery. Public visitors must be able to browse public content and product discovery experiences without an account.

Authentication, authorization, and business profiles are separate concerns. Authentication proves identity; authorization determines allowed actions; profile and preference data serve product needs.

Use least privilege, explicit authorization rules, and server-enforced access control. Never trust client-provided identity, role, entitlement, or ownership claims.

Authorization is enforced at trusted application, provider, and persistence boundaries. UI visibility, client state, route hiding, and client-provided role information are never authorization. Provider-level authorization complements application/service authorization and business validation; it does not replace either.

Collect only data necessary for a stated product purpose. Store consent independently from authentication where appropriate, make preferences reversible, and avoid exposing personal data through logs, analytics, URLs, or client state.

Secrets, service credentials, tokens, and privileged provider clients must remain outside client bundles and source control.

## 10. Public Experience, UI, and Design Governance

Every public experience should feel clear, premium, calm, trustworthy, and approachable. The interface must prioritize fashion discovery and user confidence over technical complexity or visual novelty.

Design mobile-first. Desktop layouts extend the mobile experience; they do not replace it. Use semantic HTML, predictable navigation, meaningful calls to action, and progressive disclosure.

Products and useful content take priority over decoration. Motion must improve feedback, orientation, continuity, or interaction; it must respect user preferences and never become visual noise.

Consistency is more valuable than novelty. Reusable components should preserve recognizable behavior while allowing only purposeful variation.

The Playground is an internal engineering laboratory. It must remain noindex, nofollow, and outside public navigation. Every experiment must eventually be adopted into production, documented as a decision, or removed.

## 11. SEO, Accessibility, and Performance Principles

Every indexable public route must have a unique purpose, clear search intent, semantic structure, useful metadata, and meaningful internal paths to related public content. Never create pages that duplicate intent or compete for the same keyword purpose without a deliberate strategy.

Indexing policy is explicit. Public discovery routes are crawlable when appropriate; internal tools, experiments, previews, account-transition routes, and non-public experiences must be deliberately excluded when appropriate.

Accessibility is non-negotiable. Interactive controls require keyboard access, visible focus, descriptive labels, and understandable states. Informative images require appropriate text alternatives. Interfaces must respect reduced-motion preferences and avoid relying solely on color, hover, or gesture.

Performance is designed, measured, and protected. Avoid unnecessary client JavaScript, blocking media, excessive layout movement, and unbounded data work. Measure before optimizing and validate material changes using the quality strategy.

SEO, accessibility, and performance implementation details, keyword research, targets, and tooling belong in dedicated strategy documents.

## 12. Code Quality and Documentation Standards

REVA application code uses TypeScript unless an approved RFC establishes a different boundary. Type safety is required: avoid `any`, prefer explicit contracts, and keep unsafe external data at validated boundaries.

Names must communicate responsibility. Functions and components should be small, focused, and predictable. Prefer pure functions when practical and avoid hidden side effects.

Comments explain why a non-obvious decision exists, not what obvious code does. Exported APIs and complex boundaries require concise documentation of their responsibility and constraints.

Expected failures must have clear user-safe handling. Unexpected failures must be observable through an approved logging or monitoring boundary without exposing sensitive data. Do not leave debug output, dead code, unexplained temporary behavior, or duplicate logic in production paths.

Hardcoded presentation values are acceptable when local and intentional. Configuration, provider identifiers, contact-channel URLs, secrets, environment-specific values, and business rules must have explicit ownership rather than being scattered through UI code.

Public presentation contracts expose only deliberately approved public information. Internal persistence identifiers, operational data, privileged metadata, and infrastructure references must remain internal unless their publication has an explicit product and security rationale.

## 13. Quality Validation Principles

Validation is proportional to risk. A change is incomplete when it introduces known regressions, inaccessible interaction, unclear failure behavior, security exposure, or unexplained debt.

Public experience changes require appropriate verification of responsive behavior, navigation, semantics, keyboard interaction, metadata, and performance impact. Data, authentication, storage, and security changes require stronger validation of authorization, integrity, privacy, and failure paths.

Every completed change must leave the repository buildable, lint-clean, understandable, and within its approved scope. Validation tools, test frameworks, thresholds, CI configuration, and operational checklists belong in the Quality Strategy.

## 14. Change Governance and RFC Policy

Major architectural changes require research, discussion, and explicit developer approval before implementation. This includes changes to architecture, storage, authentication, data model, dependency policy, provider strategy, security posture, or public conversion strategy.

An RFC records the problem, constraints, alternatives, consequences, approval, and implementation boundaries of a material decision. Approved RFCs are durable references; rejected alternatives do not become hidden assumptions.

Keep reversible experiments isolated. Do not use production code, schema changes, or provider commitments to test an unapproved architectural hypothesis.

## 15. Git and Collaboration Boundaries

Git state changes require explicit developer approval. Never automatically create or switch branches, commit, push, merge, rewrite history, or delete branches.

Keep changes focused, reviewable, and limited to the requested scope. Preserve unrelated work in a dirty tree. Validate intended changes before proposing a commit or merge.

Collaboration should make decisions understandable. Explain material trade-offs, surface conflicts early, and ask when a missing decision would materially change the result.

## 16. Documentation Governance

AGENTS.md contains permanent engineering policy only.

The following belong outside this constitution:

- Product requirements, backlog, user flows, and roadmap.
- Sprint history and current implementation status.
- Architecture Decision Records and RFCs.
- Data Architecture, storage conventions, schema design, and migration plans.
- SEO research, keyword maps, content strategy, and measurement targets.
- Design System decisions, visual tokens, and approved UI patterns.
- Quality Strategy, testing tooling, CI rules, and operational runbooks.
- README setup instructions, current technology inventory, and development commands.

Documentation must name its owner and purpose. When a decision stops being timeless, move it to the appropriate document rather than expanding AGENTS.md.

## 17. Non-Negotiable Constraints

- Do not access persistence, storage, privileged APIs, or provider administration clients from UI components.
- Do not expose secrets, tokens, service credentials, or private data to the client.
- Do not install dependencies without explicit approval and impact analysis.
- Do not require authentication for public discovery.
- Do not make material architectural or provider changes without an approved RFC.
- Do not let Playground experiments enter the public product unintentionally.
- Do not couple domain models or business rules to a specific provider.
- Do not implement first and justify later when Research First applies.
- Do not sacrifice accessibility, performance, trust, or search usefulness for decorative complexity.

## 18. Constitution Evolution

Changes to AGENTS.md require the same care as other major architectural changes: research, rationale, review, and explicit developer approval.

Every new rule must be durable, testable in intent, and applicable beyond the current implementation. Remove superseded rules rather than preserving historical notes. Do not use this document as a changelog.

The constitution evolves deliberately so REVA can evolve safely.
