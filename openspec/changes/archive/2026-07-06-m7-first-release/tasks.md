# Tasks: m7-first-release

## 1. Release governance and docs

- [x] 1.1 Resolve ADR O1/O2 in `docs/community/release-process.md` and `docs/adr/009-release-governance.md`
- [x] 1.2 Update `docs/project-status.md` M7 sign-off tracking (automated + maintainer checklist)
- [x] 1.3 Add maintainer sign-off section to `examples/block-morphing/README.md`

## 2. Consumer smoke (G8)

- [x] 2.1 Implement `scripts/consumer-smoke.mjs` and root `consumer:smoke` script
- [x] 2.2 Add `consumer:smoke` to CI quality job

## 3. Publish metadata (G2)

- [x] 3.1 Remove `private: true` from five linked packages
- [x] 3.2 Add Changeset for `0.1.0` first release

## 4. Release CI (G10)

- [x] 4.1 Add `.github/workflows/release.yml`
- [x] 4.2 Update `README.md` with npm install instructions (canary)

## 5. Validation

- [x] 5.1 `pnpm consumer:smoke` and `pnpm check` green
- [x] 5.2 Sync `openspec/specs/validation-suite/spec.md`
