# Task 01: Record react-basic baseline and freeze PR A boundary

Change: demo-slice-react-basic-pr0
Spec Requirement: validation-suite / React basic demo slice north star acceptance is frozen for PR A
Source Docs:

- docs/engineering/demo-slice-delivery-program.md
- openspec/changes/demo-slice-react-basic-pr0/change-brief.md
- openspec/changes/demo-slice-react-basic-pr0/specs/validation-suite/spec.md
  Depends On:
  Parallel Group:
  Barrier: false
  Allowed Files:
- openspec/changes/demo-slice-react-basic-pr0/baseline-record.md
- openspec/changes/demo-slice-react-basic-pr0/change-brief.md
- docs/engineering/demo-slice-delivery-program.md
- examples/react-basic/README.md
- .superpowers/tasks/demo-slice-react-basic-pr0/01-record-baseline-and-freeze-boundary.md
- .superpowers/runs/demo-slice-react-basic-pr0/validation.md
  Forbidden Files:
- packages/**
- .skills/aether-workflow/**
- AI_NATIVE_ENGINEERING_WORKFLOW.md
- openspec/specs/**
- AGENTS.md
- CONTRIBUTING.md
  Implementation Notes:

1. Run `pnpm --filter @aether-md/example-react-basic typecheck` as automated baseline gate.
2. Attempt local dev smoke per README (`pnpm build` at root if needed, then `pnpm --filter @aether-md/example-react-basic dev`). If browser automation unavailable, record **manual** intuitive verification steps and observed gaps.
3. Create `openspec/changes/demo-slice-react-basic-pr0/baseline-record.md` with a table mapping each delta scenario to `pass` | `gap` | `unknown` and short notes.
4. Update `examples/react-basic/README.md` with a **PR A acceptance checklist** section linking to the delivery program and this change's delta spec.
5. Update `docs/engineering/demo-slice-delivery-program.md`: current phase **PR0 已完成 / PR A 边界已冻结**; append progress log row.
6. Update this task Status, Run Log, Deviation.
   TDD Notes:
   Design-stage validation entry: baseline-record scenarios are the failing checklist PR A must turn green. No new automated test in this task unless a docs-only smoke script is explicitly in scope (prefer gap documentation over premature test code).
   Validation:

- `pnpm --filter @aether-md/example-react-basic typecheck`
- `openspec validate demo-slice-react-basic-pr0` (if available)
- Manual or documented review that `baseline-record.md` covers all six delta scenarios
  Intuitive Verification:
- Maintainer can read `baseline-record.md` and understand what PR A must fix without opening packages
  Review Checklist:
- [ ] No `packages/**` changes
- [ ] PR A allowed/forbidden files match change-brief
- [ ] Delivery program phase updated
- [ ] Each delta scenario has pass/gap/unknown in baseline-record
      Rollback Notes:
      Revert baseline-record, README checklist section, delivery program progress lines, and task run log.
      Version Impact:
      none
      Commit Scope:
      docs(spec): freeze react-basic demo slice PR0 boundary
      Status: completed
      Run Log:
- 2026-07-06: typecheck pass; baseline-record.md created; README checklist; delivery program updated to PR0 complete.
  Deviation:
- Browser `pnpm dev` not run in session; maintainer sign-off checkbox open in baseline-record.md.
