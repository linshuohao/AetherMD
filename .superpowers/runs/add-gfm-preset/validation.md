# Validation Record: add-gfm-preset

## Scope

- Change: add-gfm-preset
- Branch: feat/add-gfm-preset
- Final validation: Task 11 (2026-07-05)

---

## Task 01: define-gfm-document-model-tests

- Requirement: document-model / GFM built-in types, Extended types export, CustomBlock outside GFM matrix
- Version impact: none

### Commands

| Command                                                                                     | Purpose          | Result | Notes                                    |
| ------------------------------------------------------------------------------------------- | ---------------- | ------ | ---------------------------------------- |
| `pnpm core:test`                                                                            | Core unit tests  | PASS   | 61/61 pass (3 new GFM/CustomBlock tests) |
| `pnpm --filter @aether-md/core exec tsc --noEmit`                                           | TypeScript check | PASS   | exit 0                                   |
| `rg -i "remark\|prosemirror\|react\|vue\|gfm" packages/core/package.json packages/core/src` | Boundary check   | PASS   | Only test comments/fixtures mention gfm  |

### TDD Integrity

- Red signal: New GFM fixture and CustomBlock contract tests added (types pre-existed from M3).
- Green result: All new tests pass on first run (expected per task TDD Notes).
- Refactor check: Separate describe blocks for GFM matrix vs CustomBlock.
- Deviation: Tests passed immediately because M3 already exported GFM types; no production edits needed.

### Changed-file Check

- Files: `packages/core/src/document-model.test.ts`
- Boundary result: PASS

---

## Task 02: implement-gfm-document-model-types

- Requirement: document-model / GFM types export confirmation
- Version impact: none

### Commands

| Command          | Result | Notes |
| ---------------- | ------ | ----- |
| `pnpm core:test` | PASS   | 61/61 |
| `tsc --noEmit`   | PASS   |       |
| boundary rg      | PASS   |       |

### TDD Integrity

- Zero production diff; types pre-exist from M3.

### Changed-file Check

- Files: none

---

## Task 03: define-remark-gfm-parser-serializer-tests

- Requirement: adapter-base / Remark GFM parse and serialize (red phase)
- Version impact: none

### Commands

| Command                                       | Result        | Notes                  |
| --------------------------------------------- | ------------- | ---------------------- |
| `pnpm --filter @aether-md/plugin-remark test` | EXPECTED FAIL | 11 GFM fail, 7 M3 pass |
| `tsc --noEmit`                                | PASS          |                        |

### TDD Integrity

- Red signal: 11 GFM tests fail with paragraph/text instead of structured nodes.

### Changed-file Check

- Files: `parser.test.ts`, `serializer.test.ts`

---

## Task 04: implement-remark-gfm-parser-serializer

- Requirement: adapter-base / Remark GFM parse and serialize
- Version impact: `@aether-md/plugin-remark` minor extension; `remark-gfm` in lockfile

### Commands

| Command                                       | Result | Notes |
| --------------------------------------------- | ------ | ----- |
| `pnpm --filter @aether-md/plugin-remark test` | PASS   | 18/18 |
| `tsc --noEmit`                                | PASS   |       |
| core boundary rg                              | PASS   |       |

### Changed-file Check

- Files: `parser.ts`, `serializer.ts`, `package.json`, `pnpm-lock.yaml`

---

## Task 05: define-prosemirror-gfm-engine-tests

- Requirement: adapter-base / ProseMirror engine preserves GFM structures
- Version impact: none

### Commands

| Command                                            | Result        | Notes              |
| -------------------------------------------------- | ------------- | ------------------ |
| `pnpm --filter @aether-md/plugin-prosemirror test` | EXPECTED FAIL | 5 GFM fail, 8 pass |

### Changed-file Check

- Files: `conversion.test.ts`, `engine.test.ts`, `fixtures/gfm-doc.ts`

---

## Task 06: implement-prosemirror-gfm-engine

- Requirement: adapter-base / ProseMirror GFM engine/conversion
- Version impact: `@aether-md/plugin-prosemirror` minor extension

### Commands

| Command                                            | Result | Notes |
| -------------------------------------------------- | ------ | ----- |
| `pnpm --filter @aether-md/plugin-prosemirror test` | PASS   | 13/13 |

### Changed-file Check

- Files: `conversion.ts`

---

## Task 07: scaffold-preset-gfm-package

- Requirement: gfm-preset / package exists, Manifest, factory
- Version impact: new `@aether-md/preset-gfm@0.0.0`

### Commands

| Command                                         | Result | Notes |
| ----------------------------------------------- | ------ | ----- |
| `pnpm --filter @aether-md/preset-gfm test`      | PASS   | 4/4   |
| `pnpm --filter @aether-md/preset-gfm run build` | PASS   |       |

### Changed-file Check

- Files: `packages/preset-gfm/**`, `pnpm-lock.yaml`

---

## Task 08: define-cross-package-gfm-roundtrip-tests

- Requirement: gfm-preset / GFM round-trip integration matrix
- Version impact: none

### Commands

| Command                                            | Result | Notes                     |
| -------------------------------------------------- | ------ | ------------------------- |
| `pnpm --filter @aether-md/preset-gfm test`         | PASS   | 12/12 (7 matrix + guards) |
| `pnpm --filter @aether-md/plugin-prosemirror test` | PASS   | M3 round-trip regression  |

### Deviation

- Integration tests passed on first run (Task 04/06/07 prerequisites complete).

### Changed-file Check

- Files: `packages/preset-gfm/src/round-trip.test.ts`

---

## Task 09: implement-serialization-error-placeholder-strategy

- Requirement: adapter-base / SerializationError and placeholder strategy
- Version impact: `@aether-md/plugin-remark` behavior extension

### Commands

| Command                                       | Result | Notes |
| --------------------------------------------- | ------ | ----- |
| `pnpm --filter @aether-md/plugin-remark test` | PASS   | 21/21 |
| `pnpm --filter @aether-md/preset-gfm test`    | PASS   | 12/12 |

### Changed-file Check

- Files: `serializer.ts`, `serializer.test.ts`

---

## Task 10: reinforce-package-boundary-and-non-goals-guards

- Requirement: core-bootstrap / workspace preset without core re-export
- Version impact: none

### Commands

| Command                                              | Result | Notes                         |
| ---------------------------------------------------- | ------ | ----------------------------- |
| `pnpm core:test`                                     | PASS   | 61/61                         |
| boundary rg guards                                   | PASS   | No production violations      |
| `rg transactionFailed command-event-runtime`         | PASS   | No matches (no auto rollback) |
| `rg core:engine\|core:parser bootstrap/capabilities` | PASS   | Not in M1 core set            |

### Changed-file Check

- Files: `packages/core/src/package-boundary.test.ts`

---

## Task 11: run-full-validation

### Commands

| Command                                            | Purpose                 | Result | Notes                      |
| -------------------------------------------------- | ----------------------- | ------ | -------------------------- |
| `pnpm check`                                       | Full workspace pipeline | PASS   | 4 packages, 12 turbo tasks |
| `openspec validate add-gfm-preset --strict`        | OpenSpec validation     | PASS   |                            |
| `pnpm core:test`                                   | Core tests              | PASS   | 61/61                      |
| `pnpm --filter @aether-md/plugin-remark test`      | Remark tests            | PASS   | 21/21                      |
| `pnpm --filter @aether-md/plugin-prosemirror test` | Prosemirror tests       | PASS   | 13/13                      |
| `pnpm --filter @aether-md/preset-gfm test`         | Preset tests            | PASS   | 12/12                      |

### Test Count Summary

| Package                         | Tests   | Status   |
| ------------------------------- | ------- | -------- |
| `@aether-md/core`               | 61      | PASS     |
| `@aether-md/plugin-remark`      | 21      | PASS     |
| `@aether-md/plugin-prosemirror` | 13      | PASS     |
| `@aether-md/preset-gfm`         | 12      | PASS     |
| **Total**                       | **107** | **PASS** |

### Non-goals Checklist

- [x] No `createEditor` / React Shell / Vue Shell
- [x] No `bootstrapCore` Adapter loading in integration tests
- [x] No `transactionFailed` auto emit in command-event-runtime
- [x] No silent `core:engine` / `core:parser` in M1 capabilities
- [x] No `CustomBlock` structured round-trip in GFM matrix
- [x] No compile-layer / nested lists / tables scope creep
- [x] Core has no remark/prosemirror/react/vue runtime deps
- [x] Core does not re-export preset (`presetGfm`, `createGfmPreset`)

### Version Impact Confirmation

- `@aether-md/core`: no breaking change
- `@aether-md/preset-gfm`: new package `0.0.0`
- `@aether-md/plugin-remark`: minor GFM + SerializationError extension; `remark-gfm` added
- `@aether-md/plugin-prosemirror`: minor GFM schema/conversion extension
- `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS`: unchanged `[1]`
- `pnpm-lock.yaml`: updated (`remark-gfm`, workspace links)

### Failures And Deviations (Summary)

| Task       | Deviation                                                     |
| ---------- | ------------------------------------------------------------- |
| 01         | TDD immediate-pass (M3 types pre-exported)                    |
| 02         | Zero production diff                                          |
| 08         | Integration tests green on first run (prerequisites complete) |
| All others | none                                                          |

### Ready for Review

- **Yes** — ready for `aether-workflow-review-compliance`
