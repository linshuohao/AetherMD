# complete-v1-before-release Implementation Plan

## Change

- OpenSpec change: `complete-v1-before-release`
- Status: In progress
- Version impact: First publish `1.0.0` at Wave 10
- Expected commit scope: Multiple waves on `feature/complete-v1-before-release` → merge to main

## Source Artifacts

- Proposal: `openspec/changes/complete-v1-before-release/proposal.md`
- Design: `openspec/changes/complete-v1-before-release/design.md`
- Delta specs: 12 capability folders under change specs/
- ADR: 009 (to be revised Wave 1)

## Implementation Phases

1. Wave 1: builtin-services (History, Selection, Clipboard)
2. Wave 2: Command Pipeline (Guards, Queue, HistoryCapture)
3. Wave 3: Manifest + compile-layer + ConflictResolver + bootstrapCore adapters
4. Wave 4: PermissionGuard
5. Wave 5: Worker runtime
6. Wave 6: Error model complete
7. Wave 7: Vue shell
8. Wave 8: Telemetry
9. Wave 9: Host ConflictResolver injection
10. Wave 10: Examples matrix, E2E blocking, publish 1.0.0

## Task Breakdown

| Task                           | Outcome                   | Depends On | Parallel Group | Barrier |
| ------------------------------ | ------------------------- | ---------- | -------------- | ------- |
| 01-history-service             | History + undo/redo       | none       | wave1-a        | false   |
| 02-selection-service           | SelectionService          | 01         | wave1-b        | false   |
| 03-clipboard-service           | ClipboardService          | none       | wave1-b        | false   |
| 04-wire-builtin-services       | EditorContext integration | 01,02,03   | wave1-c        | true    |
| 05-revise-adr-release-strategy | ADR 009 + docs            | none       | wave1-docs     | false   |

## Validation Matrix

| Phase   | Validation                                             |
| ------- | ------------------------------------------------------ |
| Wave 1  | `pnpm check` + history integration test                |
| Wave 10 | `pnpm check` + `pnpm e2e:test` + `pnpm consumer:smoke` |
