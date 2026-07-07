# Task 20: OpenSpec main spec sync + full check barrier

Change: architecture-compliance-remediation
Spec Requirement:

- react-shell / Replace renderParagraphFromBlock with interactiveRenderer path
- validation-suite / E2E CI posture accuracy
  Source Docs:
- .codex/skills/openspec-sync-specs/SKILL.md
  Depends On: T13,T14,T15,T16,T17,T18,T19,T21,T22,T23
  Parallel Group: wave-6d
  Barrier: true
  Allowed Files:
- openspec/specs/**
- openspec/changes/architecture-compliance-remediation/tasks.md
- .changeset/** (if version impact summary needed)
  Forbidden Files:
- packages/** (unless fixing sync-discovered drift requires — escalate)
  Implementation Notes:
- Run openspec-sync-specs for architecture-compliance-remediation change.
- Fix react-shell spec: `renderParagraphFromBlock` → `RenderedBlockHost` + `interactiveRenderer`.
- Reconcile validation-suite E2E continue-on-error vs blocking CI.
- Mark all completed tasks [x] in tasks.md.
  TDD Notes:
- `openspec validate architecture-compliance-remediation --strict`
  Validation:
- `pnpm check`
- openspec validate
  Intuitive Verification:
- Main specs match implemented behavior.
  Review Checklist:
- No stale renderParagraphFromBlock in openspec/specs
- Task checkboxes match reality
  Rollback Notes:
- Revert spec sync commit.
  Version Impact: none (docs/spec only)
  Commit Scope: docs(openspec)
  Status: done
  Run Log:
  - Synced gfm-preset main spec: replaced `manifest.runtime.interactiveRenderers` requirement with `morphingStrategies`/`morphingRegistry` plugin-field registration (T18 alignment).
  - Synced react-shell main spec: Slice A blurred scenario via `RenderedBlockHost`; Slice B/D scenarios use per-strategy `interactiveRenderer` path.
  - Reconciled validation-suite E2E CI posture: main spec updated from Phase 1 `continue-on-error` to blocking gate matching `.github/workflows/ci.yml` and `docs/engineering/test-strategy.md`.
  - Marked all tasks [x] in `openspec/changes/architecture-compliance-remediation/tasks.md`.
    Deviation:
