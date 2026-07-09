# Tasks: core-api-subpaths

## 1. Implement subpath exports and migrate consumers

- [x] Add `host.ts`, `plugin.ts`, `adapter.ts`, `document.ts`, `testing.ts` entry files.
- [x] Update `package.json` exports map and slim root `index.ts`.
- [x] Migrate monorepo imports to role-based subpaths.
- [x] Replace package-boundary tests with per-subpath whitelists.
- [x] Update `docs/architecture/core-api.md` and `docs/sdk/overview.md`.

**Validation:** `pnpm check`
