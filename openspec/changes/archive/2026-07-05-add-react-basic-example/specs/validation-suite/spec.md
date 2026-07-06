## ADDED Requirements

### Requirement: React basic example package demonstrates React Shell integration path

The workspace SHALL include `examples/react-basic` as a private workspace package that runs in a browser with a minimal Vite + React setup. The example SHALL use `AetherEditorRoot`, `AetherEditorContent`, and `useAetherEditor` from `@aether-md/react` with `createGfmPreset()` and explicit Parser, Serializer, and Engine adapter wiring consistent with M4.5 and M5 React Shell integration patterns. The example SHALL demonstrate controlled `value` and `onChange` props with Shell GateLock behavior (`prevValue === nextValue` MUST NOT reset the document). The example SHALL NOT be published to npm.

References:

- `docs/adr/009-release-governance.md`
- `docs/community/release-process.md`
- `docs/architecture/package-layout.md`
- `openspec/specs/react-shell/spec.md`

#### Scenario: React example runs locally from workspace

- **GIVEN** the workspace is installed and built
- **WHEN** a maintainer runs the `examples/react-basic` dev script
- **THEN** a browser-rendered editor loads using `@aether-md/react` with `createGfmPreset()` wiring
- **AND** the user can edit Markdown in the mounted view

#### Scenario: React example demonstrates controlled value and GateLock

- **GIVEN** `examples/react-basic` is running with a controlled `value` prop
- **WHEN** a parent component rerenders without changing the `value` string
- **THEN** the editor session is not reset
- **AND** the example UI makes the GateLock demonstration observable to the maintainer

#### Scenario: React example is private and not published

- **GIVEN** `add-react-basic-example` implementation is complete
- **WHEN** package manifests are reviewed
- **THEN** `examples/react-basic` declares `private: true`
- **AND** the example package is excluded from npm publish matrices in `docs/community/release-process.md`

## MODIFIED Requirements

### Requirement: Examples package passes TypeScript noEmit check in CI

The validation suite SHALL ensure `examples/headless-gfm` and `examples/react-basic` each pass `tsc --noEmit` as G6 gates. Each example `typecheck` task SHALL participate in root `pnpm check` through the workspace turbo pipeline.

References:

- `docs/adr/009-release-governance.md`
- `docs/architecture/ci-checklist.md`
- `docs/engineering/test-strategy.md`

#### Scenario: Headless example typechecks in check pipeline

- **GIVEN** M6 validation suite implementation is complete
- **WHEN** `pnpm check` runs at the repository root
- **THEN** `examples/headless-gfm` `typecheck` (`tsc --noEmit`) succeeds

#### Scenario: React basic example typechecks in check pipeline

- **GIVEN** `add-react-basic-example` implementation is complete
- **WHEN** `pnpm check` runs at the repository root
- **THEN** `examples/react-basic` `typecheck` (`tsc --noEmit`) succeeds

#### Scenario: Existing M1 through M6 tests remain green

- **GIVEN** the validation suite adds or extends example typecheck gates
- **WHEN** `pnpm check` runs at the repository root
- **THEN** all existing workspace package build, typecheck, and test tasks continue to succeed
