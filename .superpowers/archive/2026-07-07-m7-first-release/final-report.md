# Final Report: m7-first-release

## Change

- Path: Full Change
- OpenSpec change: `m7-first-release`
- Final status: **engineering complete** — publish pending maintainer actions
- Version impact: Changeset `m7-first-canary.md` → `0.1.0` on version PR merge

## Validation Results

- `pnpm consumer:smoke` — pass
- `pnpm check` — pass

## Remaining Maintainer Actions

1. L1/L2 browser sign-off (`docs/project-status.md` table)
2. GitHub secret `NPM_TOKEN`
3. `pnpm changeset pre enter canary` before first publish
4. Merge changeset version PR → Release CI publishes

## Files Changed

- `scripts/consumer-smoke.mjs`
- `.github/workflows/release.yml`, `.github/workflows/ci.yml`
- five `packages/*/package.json` (remove private)
- `.changeset/m7-first-canary.md`
- `docs/adr/009-release-governance.md`, `docs/community/release-process.md`, `docs/project-status.md`
- `README.md`, `examples/block-morphing/README.md`
- `openspec/specs/validation-suite/spec.md`
