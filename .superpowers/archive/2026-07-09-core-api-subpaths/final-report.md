# Final Report: core-api-subpaths

## Change

- OpenSpec change: `core-api-subpaths`
- Archive path: `openspec/changes/archive/2026-07-09-core-api-subpaths/`
- Final status: **completed**
- Version impact: `@aether-md/core` **major** (breaking default export); additive subpaths

## Source Docs

- `docs/architecture/core-api.md`
- `docs/architecture/principles.md`
- `docs/sdk/overview.md`
- `docs/architecture/compatibility.md`

## Specs Updated

- `openspec/specs/core-bootstrap/spec.md` — role-based subpath requirements

## Tasks Completed

| Task                   | Status    | Validation        | Deviation |
| ---------------------- | --------- | ----------------- | --------- |
| `01-core-api-subpaths` | completed | `pnpm check` pass | none      |

## Files Changed

| File area                                                     | Task / Reason       | Notes              |
| ------------------------------------------------------------- | ------------------- | ------------------ |
| `packages/core/src/{host,plugin,adapter,document,testing}.ts` | Subpath entry files | New public surface |
| `packages/core/package.json`                                  | exports map         | 5 subpaths         |
| `packages/core/src/index.ts`                                  | Host-only root      | Breaking           |
| `packages/**` import paths                                    | Consumer migration  | ~63 files          |
| `docs/**`, `openspec/specs/**`                                | Docs/spec sync      |                    |
| `examples/**`                                                 | Example imports     |                    |

## Validation Results

- `pnpm check` — pass (full workspace)

## Deviations

- none

## Docs / ADR Updates

- `docs/architecture/core-api.md` — role import table
- `docs/sdk/overview.md` — type entry by role
- `docs/architecture/compatibility.md` — export change record
- No ADR required

## Remaining Follow-ups

- External consumers outside monorepo must migrate imports when upgrading `@aether-md/core`
