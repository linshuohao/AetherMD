# Task 18: interactiveRenderers manifest resolution

Change: architecture-compliance-remediation
Spec Requirement:

- gfm-preset / Requirement: interactiveRenderers consumed or removed with aligned types
  Source Docs:
- docs/sdk/manifest.md
- packages/preset-gfm/src/manifest.ts
  Depends On: T13
  Parallel Group: wave-6b
  Barrier: false
  Allowed Files:
- packages/core/src/manifest/manifest.ts
- packages/preset-gfm/src/manifest.ts
- docs/sdk/manifest.md
  Forbidden Files:
- packages/react/**
- packages/vue/**
  Implementation Notes:
- **Preferred:** Remove `interactiveRenderers` from gfmManifest runtime; document that `plugin.morphingStrategies` is the runtime source. Update SDK manifest.md accordingly.
- **Alternative:** Extend `RuntimeManifest` type and wire bootstrap reader — only if removal breaks spec tests.
- Remove `as RuntimeManifest` cast hack in preset manifest.
  TDD Notes:
- Red: typecheck fails on cast removal until field relocated.
- Green: clean manifest types.
  Validation:
- `pnpm typecheck`
- `pnpm --filter @aether-md/preset-gfm test`
  Intuitive Verification:
- No comment saying "Core does not read interactiveRenderers" without resolution.
  Review Checklist:
- Single runtime path for morphing renderers
- SDK docs match implementation
  Rollback Notes:
- Restore manifest field with cast.
  Version Impact: minor
  Commit Scope: refactor(preset)
  Status: done
  Run Log:
  - Removed `interactiveRenderers` and `as RuntimeManifest` cast from `gfmManifest`; morphing documented via `plugin.morphingStrategies` / `morphingRegistry`.
  - Updated `docs/sdk/manifest.md` and openspec change delta `specs/gfm-preset/spec.md`.
    Deviation:
