# Task 01: Implement PR0 demo slice acceptance

Change: demo-slice-react-basic
Spec Requirement: validation-suite / React basic demo slice PR0 acceptance is verified in CI
Source Docs:

- docs/engineering/demo-slice-delivery-program.md
- openspec/changes/demo-slice-react-basic-pr0/baseline-record.md
- openspec/changes/demo-slice-react-basic/change-brief.md
- openspec/changes/demo-slice-react-basic/specs/validation-suite/spec.md
  Depends On:
  Parallel Group:
  Barrier: false
  Allowed Files:
- packages/react/src/demo-slice-pr0-acceptance.integration.test.tsx
- packages/react/src/**/*.tsx
- packages/react/src/**/*.ts
- packages/plugins/plugin-prosemirror/src/view-bridge.ts
- packages/plugins/plugin-prosemirror/src/view-bridge.test.ts
- examples/react-basic/src/**
- examples/react-basic/README.md
- openspec/changes/demo-slice-react-basic/**
- openspec/specs/validation-suite/spec.md
- docs/engineering/demo-slice-delivery-program.md
- openspec/changes/demo-slice-react-basic-pr0/baseline-record.md
- .superpowers/tasks/demo-slice-react-basic/01-implement-pr0-demo-slice-acceptance.md
- .superpowers/runs/demo-slice-react-basic/**
  Forbidden Files:
- .skills/aether-workflow/**
- AI_NATIVE_ENGINEERING_WORKFLOW.md
- openspec/specs/** (except validation-suite/spec.md sync)
- packages/core/**
- AGENTS.md
  Implementation Notes:

1. TDD: add `demo-slice-pr0-acceptance.integration.test.tsx` mirroring App (controlled value, preview, rerender button pattern).
2. GFM fixture markdown must include heading, strong, list, link.
3. Use ProseMirror `insertText` or `core:replaceText` through mounted Shell to prove consecutive edits update preview.
4. Reuse GateLock rerender assertion pattern from `gate-lock.integration.test.tsx`.
5. Fix `view-bridge.ts` only if tests prove heading/list sync gaps.
6. Update `examples/react-basic` initial markdown to showcase subset.
7. Sync PR0 scenarios into `openspec/specs/validation-suite/spec.md` (ADD north star requirement from PR0 delta + PR A verification requirement).
8. Update delivery program → PR A complete; baseline-record scenario statuses.
   TDD Notes:
   Red: new integration test file fails before fixes. Green: test passes with minimal view-bridge/react-basic changes.
   Validation:

- `pnpm --filter @aether-md/react test`
- `pnpm --filter @aether-md/example-react-basic typecheck`
- `pnpm check`
  Intuitive Verification:
- Optional: `pnpm --filter @aether-md/example-react-basic dev` and walk README checklist
  Review Checklist:
- [ ] No forbidden files
- [ ] Matches PR0 allowed surface
- [ ] All four PR A delta scenarios covered by test or docs
      Rollback Notes:
      Revert test file, view-bridge changes, react-basic App, main spec sync.
      Version Impact:
      none
      Commit Scope:
      feat(react): verify demo slice PR0 acceptance in CI
      Status: completed
      Run Log:
- 2026-07-06: Added demo-slice-pr0-acceptance.integration.test.tsx (3 cases); updated App.tsx GFM fixture; synced validation-suite main spec; tests pass.
  Deviation:
- Browser manual dev walk deferred; CI happy-dom acceptance mirrors react-basic Shell.
