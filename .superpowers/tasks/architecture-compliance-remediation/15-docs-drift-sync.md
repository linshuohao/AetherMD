# Task 15: Docs drift sync (README, matrix, E2E counts)

Change: architecture-compliance-remediation
Spec Requirement:

- validation-suite / Requirement: Examples matrix and README reflect actual showcase capabilities
- product-experience / Requirement: L1/L2 tier labeling must not misrepresent Vue as L1-only
  Source Docs:
- docs/architecture/product-experience-spec.md
- docs/examples/matrix.md
- docs/project-status.md
  Depends On: none
  Parallel Group: wave-6a
  Barrier: false
  Allowed Files:
- README.md
- docs/examples/matrix.md
- docs/engineering/test-strategy.md
- docs/sdk/README.md
- docs/sdk/vue-shell.md (create minimal stub)
  Forbidden Files:
- packages/**
- openspec/specs/**
  Implementation Notes:
- README L31: add Vue `content/morphing` dual-mode + L2 morphing.
- matrix.md: Vue row lists `AetherMorphingDocument` + `AetherEditorContent`.
- E2E counts: React 24 (21 morphing + 3 basic), Vue project documented.
- Create minimal `docs/sdk/vue-shell.md` mirroring react-shell L2-primary posture.
- Fix sdk/README.md react-shell index line (not "Phase 0 only").
  TDD Notes:
- N/A — documentation task; verify links with `rg` for broken references.
  Validation:
- `rg "examples/vue" README.md docs/examples/matrix.md` shows morphing
- `pnpm skills:check` if workflow docs touched (not expected)
  Intuitive Verification:
- Reader can find Vue L2 morphing from README without opening source.
  Review Checklist:
- No false claims that Vue lacks morphing
- E2E test counts match actual spec files
  Rollback Notes:
- Revert doc files only.
  Version Impact: none
  Commit Scope: docs(examples)
  Status: done
  Run Log:
  - README.md: Vue row now L1 Content + L2 Morphing; E2E section documents react (24) + vue (3) Playwright projects.
  - docs/examples/matrix.md: Vue shell column lists AetherMorphingDocument + AetherEditorContent; CI gate row updated.
  - docs/engineering/test-strategy.md: E2E layer, layout, and CI sections document react/vue projects and test counts.
  - docs/sdk/README.md: react-shell index fixed (L2 primary); added vue-shell.md entry.
  - docs/sdk/vue-shell.md: created minimal L2-primary Vue Shell doc mirroring react-shell.md.
  - Verified: `rg "examples/vue" README.md docs/examples/matrix.md` shows morphing references.
