## 1. Product experience specification

- [x] 1.1 Create `docs/architecture/product-experience-spec.md` with Instant Morphing, Block Focus, zero-latency typing, layer table, and acceptance scenarios
- [x] 1.2 Update `docs/architecture/principles.md` link to point at the new spec path
- [x] 1.3 Add glossary entries for Instant Morphing, Block Focus, rendered state, source state, Phase 0 interim shell

## 2. North star narrative alignment

- [x] 2.1 Update `docs/project-status.md` with L1 (architecture demo) vs L2 (product morphing) layers
- [x] 2.2 Update `docs/architecture/roadmap.md` with Slice A–D follow-up pointers (planning only)
- [x] 2.3 Update `docs/README.md` reading path to include product experience spec
- [x] 2.4 Update `examples/react-basic/README.md` to state architecture/pipeline demo role (not product morphing)

## 3. OpenSpec closure

- [x] 3.1 Run `openspec validate align-instant-morphing-north-star --strict`
- [x] 3.2 Archive change and sync main specs (`product-experience`, `react-shell`, `validation-suite`) via `aether-workflow-update-docs-spec`

## 4. Follow-up (out of scope for this change)

- [ ] 4.1 Open Full Change `block-morphing-slice-1` for single-paragraph morphing MVP implementation
- [ ] 4.2 Define `examples/block-morphing` scaffold in that change
