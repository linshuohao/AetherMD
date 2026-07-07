# Task 17: Legacy subpath export + optional PM peer

Change: architecture-compliance-remediation
Spec Requirement:

- react-shell / vue-shell / Requirement: Legacy L1 surface isolated from primary export
  Source Docs:
- openspec/changes/architecture-compliance-remediation/proposal.md
  Depends On: T13
  Parallel Group: wave-6c
  Barrier: false
  Allowed Files:
- packages/react/package.json
- packages/react/src/index.ts
- packages/react/src/legacy.ts (create subpath entry)
- packages/vue/package.json
- packages/vue/src/index.ts
- packages/vue/src/legacy.ts
- packages/react/src/package-boundary.test.ts
- packages/vue/src/package-boundary.test.ts
- docs/sdk/react-shell.md
  Forbidden Files:
- packages/core/**
  Implementation Notes:
- Move `AetherEditorContent` to `@aether-md/react/legacy` and `@aether-md/vue/legacy` subpath exports.
- Primary `"."` export: morphing surfaces + root/hook/gate-lock only.
- Move `@aether-md/plugin-prosemirror` to optionalPeerDependencies or peerDependencies with legacy subpath as the only importer.
- Update boundary tests and react-shell.md.
  TDD Notes:
- Red: boundary test fails if primary index exports AetherEditorContent.
- Green: subpath export works; morphing path does not require PM at install time (document peer).
  Validation:
- `pnpm --filter @aether-md/react test`
- `pnpm --filter @aether-md/vue test`
- `pnpm typecheck`
  Intuitive Verification:
- `import { AetherEditorContent } from '@aether-md/react/legacy'` works.
  Review Checklist:
- **BREAKING** documented in Changeset note / task deviation
- Examples updated to import legacy from subpath if needed
  Rollback Notes:
- Restore primary index exports.
  Version Impact: **major**
  Commit Scope: feat(react)! feat(vue)!
  Status: done
  Run Log:
  - Created `packages/react/src/legacy.ts` and `packages/vue/src/legacy.ts` exporting `AetherEditorContent` + `AetherLegacyEditorContent` alias.
  - Added `./legacy` subpath to `package.json` exports for both packages.
  - Removed `AetherEditorContent` from primary `index.ts` (morphing-first only).
  - Moved `@aether-md/plugin-prosemirror` from `dependencies` to optional `peerDependencies` (`peerDependenciesMeta.optional: true`); kept in `devDependencies` for package tests.
  - Updated package-boundary tests: primary entry must not export legacy; `./legacy` subpath must.
  - Updated internal integration tests to import `AetherEditorContent` from `../legacy.js`.
  - Updated `examples/react` and `examples/vue` to import from `@aether-md/react/legacy` / `@aether-md/vue/legacy`; added explicit `@aether-md/plugin-prosemirror` dep to examples.
  - Updated `docs/sdk/react-shell.md` and `docs/sdk/vue-shell.md` with legacy subpath import guidance.
  - Split `test-d` typings: primary exports vs `legacy-exports.test-d.ts`.
  - Validation: `pnpm --filter @aether-md/react test` — 59 passed; `pnpm --filter @aether-md/vue test` — 44 passed; per-package `typecheck` green for react, vue, example-react, example-vue. Root `pnpm typecheck` (turbo) reports pre-existing cyclic build graph warning.
    Deviation:
  - **BREAKING**: `AetherEditorContent` and `AetherLegacyEditorContent` removed from primary `@aether-md/react` / `@aether-md/vue` exports. Consumers must import from `@aether-md/react/legacy` or `@aether-md/vue/legacy` and install `@aether-md/plugin-prosemirror` as a peer. Major version bump required at publish.
