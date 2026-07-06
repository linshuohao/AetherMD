# Validation Record: m7-first-release

## Scope

- Change: `m7-first-release`
- Requirement: validation-suite — consumer smoke, Release CI, publishable packages
- Version impact: minor `0.1.0` (Changeset pending merge)
- Branch: `feat/m7-first-release`
- Validated: 2026-07-06

## Commands

| Command               | Result   | Notes                                                      |
| --------------------- | -------- | ---------------------------------------------------------- |
| `pnpm consumer:smoke` | **pass** | npm install from packed tarballs + import all five entries |
| `pnpm check`          | **pass** | exit 0 after format                                        |
| `pnpm e2e:test`       | **pass** | 4/4 (from Phase 0)                                         |

## Validation Status

**PASS** — engineering gates green; browser sign-off and NPM_TOKEN remain maintainer actions.
