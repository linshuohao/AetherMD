# Changesets

AetherMD uses Changesets in M1 only as a version impact recording baseline.

Current boundaries:

- Use `pnpm changeset` when a change affects public API, package metadata, package boundaries, or SemVer expectations.
- Use `pnpm changeset:status` to inspect pending version impact records.
- Do not use Changesets to publish packages in M1.
- Do not add npm tokens, release workflows, or publish scripts as part of this baseline.
- Keep `@aether-md/core` private until the release strategy is explicitly decided.

Publish and canary timing is defined in [ADR 009](../docs/adr/009-release-governance.md) (M7 execution; M6 prep only).

Documentation-only changes usually do not need a changeset unless they change the meaning of a public contract.
