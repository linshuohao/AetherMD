# Validation Record: add-editor-orchestration

## Host Capability Probe

| Capability                       | Available                         | Fallback                  | Selected                                                |
| -------------------------------- | --------------------------------- | ------------------------- | ------------------------------------------------------- |
| Task/subagent dispatch           | yes (Task tool)                   | sequential single-session | sequential implement in coordinator session             |
| `subagent-driven-development`    | yes                               | `executing-plans`         | not used — coordinator executes tasks serially per wave |
| `dispatching-parallel-agents`    | yes                               | sequential loop           | sequential for G2–G5 traceability                       |
| `executing-plans`                | yes                               | pause                     | active loop driver                                      |
| Superpowers CLI / skill fallback | yes (skills loaded via file read) | Aether skills direct      | Aether workflow skills direct                           |

**Loop driver:** Wave-aware sequential execution (`executing-plans`). Waves: G0 → G1 (02→03→04) → G2 → G3 (06→07) → G4 → G5 → G6 (Barrier).

**Branch:** `feat/add-editor-orchestration`

## Task Validation Log

| Task | Command                                     | Result | Notes                                   |
| ---- | ------------------------------------------- | ------ | --------------------------------------- |
| 01   | `pnpm core:test`                            | PASS   | boundary flip + types export            |
| 02   | `pnpm core:test`                            | PASS   | conflict-resolver unit tests            |
| 03   | `pnpm core:test`                            | PASS   | adapter-wiring + EDITOR_ADAPTER_MISSING |
| 04   | `pnpm core:test`                            | PASS   | EditorContext stub services             |
| 05   | `pnpm core:test`                            | PASS   | createEditor orchestration startup      |
| 06   | `pnpm core:test`                            | PASS   | getDocument + lazy getMarkdown          |
| 07   | `pnpm core:test`                            | PASS   | dispatch rollback + dispose fail-closed |
| 08   | `pnpm --filter @aether-md/core test`        | PASS   | 3 GFM fixtures via createEditor         |
| 09   | `pnpm core:test` + rg guards                | PASS   | M4.5 boundary asserts                   |
| 10   | `pnpm check` + `openspec validate --strict` | PASS   | Barrier green                           |

## Barrier Evidence (Task 10)

```bash
pnpm check                          # PASS (12/12 turbo tasks)
openspec validate add-editor-orchestration --strict  # PASS
pnpm core:test                      # PASS (20 tests)
```

**Per-package test counts (barrier run):**

| Package                       | Tests |
| ----------------------------- | ----- |
| @aether-md/core               | 20    |
| @aether-md/plugin-remark      | 21    |
| @aether-md/plugin-prosemirror | 16    |
| @aether-md/preset-gfm         | 12    |

## TDD Integrity

- Red signal: package-boundary flip (Task 01); orchestration/rollback/integration tests written before implementation (Tasks 05–08)
- Green result: all task validation commands PASS
- Refactor check: createEditor helpers split; conflict-resolver wired in editor runtime register wrapper
- Deviation: see per-task Deviation sections and Failures And Deviations below

## Package Boundary Guards

```bash
rg -i "from ['\"]remark|..." packages/core/src --glob '!**/*.test.ts' --glob '!**/*.integration.test.ts'
# (no matches)

node -e "..." # deps filter → []

rg "transactionFailed" packages/core/src/command-event-runtime.ts
# (no matches)

rg "core:engine|core:parser" packages/core/src/bootstrap.ts packages/core/src/capabilities.ts
# (no matches)

rg "createGfmPreset" packages/core/src/index.ts
# (no matches)
```

## Changed-file Check

- Files reviewed: all Task 01–10 allowed paths
- Boundary result: PASS — createEditor exported; Shell/GFM preset re-export forbidden; no runtime engine deps
- Unrelated files on branch: `docs/architecture/core-api.md` (Phase 0, pre-existing; not modified this loop)

## Failures And Deviations

1. **Task 03 / errors.ts:** Added `EDITOR_ADAPTER_MISSING` and `EDITOR_DISPOSED` to `CoreErrorCode` (required for adapter wiring + dispose fail-closed; not listed in Task 03 Allowed Files).
2. **Task 08 / devDependencies:** Turbo cyclic package graph (`core → preset-gfm → core`) blocked workspace `pnpm check` with devDependencies. **Mitigation:** integration test imports `../../../preset-gfm/dist/index.js`; test script builds plugin/preset siblings; no core runtime deps added.
3. **Task 08 / tsconfig.test.json:** Test output moved to `dist-test/` to avoid parallel turbo clobbering production `dist/` (race caused preset-gfm test failures).

## Non-goals Checklist

- [x] No `@aether-md/react` / Vue / GateLock
- [x] No bootstrap silent provide `core:engine` / `core:parser`
- [x] Raw `createCommandEventRuntime` has no `transactionFailed` auto emit
- [x] No Core store / sync createEditor / Shell Adapter
- [x] Phase 0 async-only / no store / no Shell Adapter — aligned
- [x] `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` still `[1]`

## Ready For Review

**Ready for `aether-workflow-review-compliance`:** yes (pending human review-compliance skill run; implementation + Barrier validation complete).
