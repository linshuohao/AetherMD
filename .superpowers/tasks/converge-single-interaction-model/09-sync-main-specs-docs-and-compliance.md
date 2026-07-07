# Task 09: Sync main specs/docs and record compliance closure

Change: converge-single-interaction-model
Spec Requirement:

- core-bootstrap / Requirement: Core public API remains morphing-agnostic and DOM-agnostic
- editor-orchestration / Requirement: Editor command handling uses unified runtime routing
- react-shell / Requirement: React shell product surface is morphing-first
- validation-suite / Requirement: Keyboard interaction matrix is enforced on product path
  Source Docs:
- openspec/changes/converge-single-interaction-model/specs/core-bootstrap/spec.md
- openspec/changes/converge-single-interaction-model/specs/editor-orchestration/spec.md
- openspec/changes/converge-single-interaction-model/specs/react-shell/spec.md
- openspec/changes/converge-single-interaction-model/specs/validation-suite/spec.md
  Depends On: 08-expand-keyboard-deletion-matrix
  Parallel Group: wave-5
  Barrier: true
  Allowed Files:
- openspec/specs/core-bootstrap/spec.md
- openspec/specs/editor-orchestration/spec.md
- openspec/specs/react-shell/spec.md
- openspec/specs/validation-suite/spec.md
- docs/project-status.md
- openspec/changes/converge-single-interaction-model/tasks.md
- .superpowers/reviews/converge-single-interaction-model.md
- .superpowers/runs/converge-single-interaction-model/validation.md
- .superpowers/tasks/converge-single-interaction-model/09-sync-main-specs-docs-and-compliance.md
  Forbidden Files:
- packages/**
- e2e/**
  Implementation Notes:
- Sync main OpenSpec capabilities to the converged single-model implementation delivered in Tasks 01-08.
- Update long-lived status docs to use canonical showcase naming and morphing-first positioning.
- Record compliance summary and validation evidence for archive readiness.
  TDD Notes:
- Design assertion: specs/docs must no longer contradict converged contracts (core export boundary, runtime routing, morphing-first shell).
  Validation:
- `pnpm docs:check-links`
  Intuitive Verification:
- `rg "react-basic|block-morphing"` in updated main specs/docs shows no unintended active-contract references.
  Review Checklist:
- main specs aligned with implemented behavior from Tasks 03-08
- docs express canonical `examples/react` modes and morphing-first product surface
- compliance review + validation artifacts created
  Rollback Notes:
- Revert task commit to restore previous main specs/docs wording.
  Version Impact: none
  Commit Scope: docs(spec)
  Status: done
  Run Log:
- Started Task 09 on branch `feature/converge-single-interaction-model`.
- Synced main OpenSpec capabilities for core boundary, editor routing/startup dedupe, react morphing-first posture, and validation keyboard deletion matrix (`openspec/specs/{core-bootstrap,editor-orchestration,react-shell,validation-suite}/spec.md`).
- Updated long-lived project status wording to canonical showcase topology (`docs/project-status.md`).
- Marked convergence change checklist complete in `openspec/changes/converge-single-interaction-model/tasks.md`.
- Added compliance review and validation evidence artifacts:
  - `.superpowers/reviews/converge-single-interaction-model.md`
  - `.superpowers/runs/converge-single-interaction-model/validation.md`
- Archived OpenSpec change: `openspec/changes/archive/2026-07-07-converge-single-interaction-model`.
- Added final report: `.superpowers/runs/converge-single-interaction-model/final-report.md`.
- Validation passed: `pnpm docs:check-links`.
  Deviation:
- Historical archive/program references to `react-basic` remain intentionally in timeline/archive contexts (for traceability) and are not active contract statements.
