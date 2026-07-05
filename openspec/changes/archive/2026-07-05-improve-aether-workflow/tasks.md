## 1. Skill Source Unification

- [x] 1.1 Create `.skills/aether-workflow/` as the authoritative source for managed Aether workflow skills.
- [x] 1.2 Copy existing `aether-workflow-*` skill directories, assets, references, and agent metadata into the authoritative source.
- [x] 1.3 Add generated-source notices to host mirror output without changing the executable skill semantics.

## 2. Skill Sync Tooling

- [x] 2.1 Add a sync script that renders `.skills/aether-workflow/*` into `.codex/skills/*` and `.cursor/skills/*`.
- [x] 2.2 Add a check script that fails when host mirrors drift from the authoritative source.
- [x] 2.3 Add `package.json` scripts for skill sync and skill check, and decide whether the check is included in `pnpm check` or CI only.
- [x] 2.4 Update CI or documented local validation so skill drift is caught before merge.

## 3. Branch Lifecycle Workflow

- [x] 3.1 Update `AI_NATIVE_ENGINEERING_WORKFLOW.md` to add Prepare Branch before OpenSpec artifact creation.
- [x] 3.2 Update `docs/community/git-workflow.md` to clarify how OpenSpec change names map to branch names and when Codex may create branches.
- [x] 3.3 Update Aether workflow skills so create-change records branch traceability and later steps check branch scope.
- [x] 3.4 Update generated `.codex/skills/` and `.cursor/skills/` mirrors through the sync script.

## 4. Spec Sync And Validation

- [x] 4.1 Sync accepted engineering workflow requirements into `openspec/specs/engineering-workflow/spec.md`.
- [x] 4.2 Validate OpenSpec artifacts for `improve-aether-workflow`.
- [x] 4.3 Run skill mirror drift check and relevant repository checks.
- [x] 4.4 Record validation, branch state, version impact, and any deviations before archive.

## Validation Notes

- Branch: `docs/improve-aether-workflow`.
- OpenSpec validation: `openspec validate improve-aether-workflow` passed.
- Skill mirror validation: `pnpm skills:check` passed.
- Repository validation: `pnpm check` passed, including `pnpm skills:check` and Turborepo package checks.
- Version impact: no package SemVer, `manifestVersion`, public exports, lockfile, or runtime compatibility changes. The change affects engineering workflow governance and repository scripts.
- Deviation: required Superpowers process skills such as `writing-plans`, `test-driven-development`, and `verification-before-completion` were not visible in the current host skill installation, so implementation used `openspec-apply-change` with this OpenSpec checklist rather than creating `.superpowers/` plan/task/run records.
