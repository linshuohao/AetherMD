# Validation: core-api-subpaths

**Change:** core-api-subpaths  
**Result:** pass

## Commands

- `pnpm check` — pass (build, typecheck, test, lint, format, docs links, types:check)

## Requirements verified

- Default `@aether-md/core` export is host-only (`package-boundary.test.ts`)
- Subpath whitelists for plugin, adapter, document, testing entries
- Monorepo consumers migrated to role-based import paths
- `docs/architecture/core-api.md` and `docs/sdk/overview.md` updated
