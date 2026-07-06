## Context

AetherMD's accepted architecture already separates Markdown parsing, editing transactions, and host shells through `AetherDoc` and Adapter packages. Recent bridge-layer review found that the direction is sound, but future work needs sharper guidance to avoid accidental Markdown parsers, duplicate syntax ownership, and React-layer GFM logic as the project expands from M4/M5 integration proof to L2 Block Morphing slices.

Authoritative source docs:

- `docs/architecture/principles.md`
- `docs/architecture/product-experience-spec.md`
- `docs/architecture/document-model.md`
- `docs/engineering/adapter-protocol.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`
- `docs/engineering/mvp-implementation-plan.md`

## Goals / Non-Goals

**Goals:**

- Add one architecture document that summarizes the bridge-layer optimization strategy and design guardrails.
- Capture project-specific principles such as Semantic Core / Syntax at Edges, Single Syntax Authority, Block-First Interaction, and No Accidental Parser.
- Capture approved patterns that are already implied by the architecture: Adapter, Anti-Corruption Layer, Strategy, Registry, State Machine, Snapshot, and Pipeline.
- Provide examples that connect the guidance to current Remark serializer, ProseMirror conversion, preset GFM source handling, and React morphing surfaces.

**Non-Goals:**

- No runtime implementation change.
- No `ParserAdapter`, `SerializerAdapter`, `EngineAdapter`, `AetherDoc`, or React public API change.
- No replacement of the current serializer implementation in this change.
- No ADR supersession; ADR 003 remains accepted.
- No new dependency.

## Decisions

1. **Create a dedicated architecture guidance document instead of expanding `principles.md`.**
   - Rationale: `principles.md` is the charter-level page. The optimization discussion is more concrete and needs examples, rejection rules, and migration guidance.
   - Alternative considered: add a large section to `principles.md`. Rejected because it would mix charter and implementation guidance.

2. **Keep the guidance descriptive but enforceable through OpenSpec scenarios.**
   - Rationale: the document should help future implementers make decisions without changing runtime contracts today.
   - Alternative considered: immediately modify Adapter specs. Rejected because the user asked for a summary document and the implementation strategy still needs separate planning.

3. **Frame patterns as approved project patterns, not a general design-pattern catalog.**
   - Rationale: AetherMD needs boundary guidance, not generic pattern vocabulary.
   - Alternative considered: list common patterns broadly. Rejected because it would dilute the decision value.

4. **Require cross-links from architecture entry points.**
   - Rationale: the document must be discoverable during architecture review and future adapter/preset/morphing work.

## Risks / Trade-offs

- **Risk: the document becomes aspirational but unused.** → Mitigation: link it from architecture index and design-doc map, and include concrete current-code examples.
- **Risk: guidance is mistaken for completed refactor.** → Mitigation: document non-goals and separate future implementation phases.
- **Risk: adding patterns encourages over-abstraction.** → Mitigation: include rejection rules and preserve the existing "non-essential abstraction" principle.
