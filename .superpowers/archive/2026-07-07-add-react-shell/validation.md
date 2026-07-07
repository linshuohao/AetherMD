# Validation Record: add-react-shell

## Scope

- Change: `add-react-shell`
- Task: 01–10 (full task loop)
- Requirement: M5 `@aether-md/react` Shell + plugin-prosemirror view-bridge + GateLock + happy-dom integration
- Version impact: new `@aether-md/react`; `@aether-md/plugin-prosemirror` minor additive; `@aether-md/core` unchanged

## Host Capability Probe

| Capability                     | Available | Selected driver                        |
| ------------------------------ | --------- | -------------------------------------- |
| Task/subagent dispatch         | no        | sequential loop in coordinator session |
| `subagent-driven-development`  | no        | `executing-plans` fallback             |
| `dispatching-parallel-agents`  | no        | sequential loop                        |
| `executing-plans`              | yes       | used                                   |
| Superpowers TDD / verification | yes       | per-task                               |

## Commands

| Command                                            | Purpose                                | Result | Notes                    |
| -------------------------------------------------- | -------------------------------------- | ------ | ------------------------ |
| `pnpm --filter @aether-md/react test`              | Tasks 01–09 react contract/integration | PASS   | 14 tests                 |
| `pnpm --filter @aether-md/plugin-prosemirror test` | Task 05 view-bridge                    | PASS   | 20 tests                 |
| `pnpm --filter @aether-md/react build`             | Task 02 scaffold                       | PASS   |                          |
| `pnpm core:test`                                   | M1–M4.5 regression                     | PASS   | via turbo check          |
| `pnpm check`                                       | Task 10 barrier                        | PASS   | 15 turbo tasks           |
| `openspec validate add-react-shell --strict`       | Task 10 barrier                        | PASS   |                          |
| Core/React `rg` guards                             | Task 09/10 boundary                    | PASS   | no production violations |

## TDD Integrity

- Red signal: boundary tests, gate-lock unit tests, view-bridge tests, integration tests written before/alongside implementation
- Green result: all package tests + workspace check green
- Refactor check: Root `pluginsKey` stabilization; GateLock `prevControlledRef` tracks controlled prop only
- Deviation: see task-level Deviation sections (conversion.ts toDOM, engine.ts readSessionEditorState, plugin happy-dom devDeps)

## Intuitive Verification

- Method: React Shell mount + dispatch + onChange trace; GateLock equal-value parent rerender
- Result: integration and gate-lock tests pass
- Notes: integration uses dispatch path (view bridge wired; PM typing deferred to dispatch assertion for Node stability)

## Changed-file Check

- Files reviewed: all under `packages/react/**`, `packages/plugins/plugin-prosemirror/**`, `.changeset/`, `pnpm-lock.yaml`
- Boundary result: core production unchanged; react production no `prosemirror-view` direct import
- Unrelated files: none

## Non-goals Checklist

- [x] No Vue Shell, toolbar, theme, History UI
- [x] No Core Guard chain, Permission enforce, Core store, Shell Adapter
- [x] No `bootstrapCore` silent provide change
- [x] No Playwright / browser CI / `examples/react-basic`
- [x] Core no react/prosemirror/remark runtime deps; core production code unchanged
- [x] Phase 0 #2 #3 preserved (`change` bridge, no Core store, direct `AetherEditor` consumption)
- [x] `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` still `[1]`

## Failures And Deviations

- Task 05: `conversion.ts` gained `toDOM`/`parseDOM` for EditorView (required for view-bridge; not in original allowed files)
- Task 05: `engine.ts` additive `readSessionEditorState` export (internal session read for bridge sync)
- Task 05: `plugin-prosemirror` devDeps added `happy-dom` for view-bridge tests
- Task 06: Root uses `pluginsKey` (manifest names) to avoid remount on inline `plugins` array reference churn
