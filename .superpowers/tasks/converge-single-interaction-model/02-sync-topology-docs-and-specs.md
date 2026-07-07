# Task 02: Sync canonical showcase topology in docs and main specs

Change: converge-single-interaction-model
Spec Requirement:

- shell-interaction-convergence / Requirement: Shell interaction model converges to single north-star path
- product-experience / Requirement: Product interaction contract uses a single public carrier model
- validation-suite / Requirement: Validation topology references one canonical browser showcase
  Source Docs:
- docs/project-status.md
- docs/architecture/product-experience-spec.md
- openspec/specs/validation-suite/spec.md
- openspec/specs/product-experience/spec.md
  Depends On: 01-cleanup-convergence-baseline
  Parallel Group: wave-1
  Barrier: true
  Allowed Files:
- docs/**
- openspec/specs/**
- .superpowers/tasks/converge-single-interaction-model/02-sync-topology-docs-and-specs.md
  Forbidden Files:
- packages/**
- e2e/**
- openspec/changes/archive/**
  Implementation Notes:
- Replace split `examples/react-basic` / `examples/block-morphing` carrier wording with canonical `examples/react` shell-mode topology where appropriate.
- Keep archive history untouched; only active docs and main specs are in scope.
  TDD Notes:
- Failing signal: active docs/main specs still assert non-existent package names and split showcase topology.
- Use targeted grep before/after for `examples/react-basic` and `examples/block-morphing`.
  Validation:
- `rg "examples/react-basic|examples/block-morphing" docs openspec/specs`
- `pnpm docs:check-links`
  Intuitive Verification:
- Read `docs/project-status.md` and `docs/architecture/product-experience-spec.md` and confirm one canonical product showcase narrative.
  Review Checklist:
- No edits under `openspec/changes/archive/**`
- Main specs/docs no longer reference removed example packages as active carriers
- Updated wording remains consistent with north-star L1/L2 semantics
  Rollback Notes:
- Revert this task commit to restore prior docs/spec topology wording.
  Version Impact: none
  Commit Scope: docs(architecture)
  Status: done
  Run Log:
- Updated active docs to canonical showcase topology (`examples/react` content/morphing modes):
  - `docs/project-status.md`
  - `docs/architecture/product-experience-spec.md`
  - `docs/architecture/ci-checklist.md`
  - `docs/community/release-process.md`
  - `docs/architecture/package-layout.md`
  - `docs/engineering/mvp-implementation-plan.md`
  - `docs/engineering/component-library-governance.md`
- Updated main OpenSpec specs topology wording:
  - `openspec/specs/validation-suite/spec.md`
  - `openspec/specs/product-experience/spec.md`
  - `openspec/specs/engineering-workflow/spec.md`
  - `openspec/specs/react-shell/spec.md`
- Validation passed:
  - `rg "examples/react-basic|examples/block-morphing|@aether-md/example-react-basic|@aether-md/example-block-morphing" openspec/specs` => no matches
  - `pnpm docs:check-links` => pass
    Deviation:
- Historical references retained in archive/history-oriented docs:
  - `docs/adr/009-release-governance.md`
  - `docs/engineering/demo-slice-delivery-program.md`
