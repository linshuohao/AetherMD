# add-workflow-path-classification Implementation Plan

## Change

- OpenSpec change: `add-workflow-path-classification`
- Status: implementing
- Version impact: none (workflow governance only)
- Expected commit scope: `docs(workflow)`

## Source Artifacts

- Proposal: `openspec/changes/add-workflow-path-classification/proposal.md`
- Design: `openspec/changes/add-workflow-path-classification/design.md`
- Delta specs: `openspec/changes/add-workflow-path-classification/specs/engineering-workflow/spec.md`
- Branch: `docs/add-workflow-path-classification`

## Implementation Phases

1. Discover + Quick Change + Spec Change skills
2. Review/archive Spec Change mode
3. Long-lived docs + main spec sync
4. PR traceability script + validation

## Task Breakdown

| Task | Outcome | Depends On | Parallel Group |
| --- | --- | --- | --- |
| 01 | discover-context 四 path | — | A |
| 02 | quick-change skill | — | A |
| 03 | create/execute-spec-change skills | — | A |
| 04 | review + archive Spec Change 模式 | 03 | B |
| 05 | 长期文档 + main spec | 01–04 | C |
| 06 | CI script + skills sync | 02 | B |
| 07 | validation + archive | 05–06 | D |

## Validation Matrix

| Phase | Validation | Notes |
| --- | --- | --- |
| Skills | `pnpm skills:check` | mirror drift |
| Repo | `pnpm check` | full pipeline |
| Routing | Discover 样例 | 四 path + escalation |
