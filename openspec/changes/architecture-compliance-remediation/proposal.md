## Why

A full architecture audit identified residual deviations from the north-star interaction model, pure-microkernel boundaries, and zero-technical-debt goals. Although `converge-single-interaction-model` closed the first convergence wave, Core still owns morph/GFM semantics, Vue L2 violates product-experience rules, React morphing has focus-edge defects, contracts are triplicated across packages, and legacy Phase-0 surfaces remain on the public API. This change closes those gaps before M7 publish.

## What Changes

- Fix React L2 morphing edge cases: inter-block focus commit, rendered-host stability, controlled-value remount policy.
- Bring Vue L2 to spec parity: remove morphing-mode preview panel, autofocus on source morph, await in-flight edits on blur, port interaction-matrix tests.
- Extract morphing ownership from Core: move `core:parseBlockMarkdown` registration to preset; remove kernel-internal morph registry/DOM types from orchestration hot path; keep `AetherEditor` accessor opaque or shell-provided.
- Consolidate morphing contracts to a single package (`@aether-md/morphing-contracts` or preset-owned public surface); delete duplicate copies in react/vue/core.
- Remove deprecated dead code: `renderParagraphFromBlock` stub, `GfmMorphingBlockStrategy` alias, stale superpowers references where safe.
- Isolate legacy `AetherEditorContent` from primary exports (**BREAKING** positioning): morphing-only primary surface; legacy via explicit subpath or alias only until M7.
- Decouple L2 shells from runtime `plugin-prosemirror` dependency where morphing path does not need view-bridge.
- Wire manifest `interactiveRenderers` or remove dead manifest field; fix `dependsOn` stub hack in GFM wiring.
- Sync OpenSpec main specs, project-status, vue README, and react-shell spec drift (`renderParagraphFromBlock` → `interactiveRenderer`).
- Add Vue Playwright e2e subset and Vue `prosemirror-view` boundary guard.

## Capabilities

### New Capabilities

- `morphing-contracts`: single public morphing strategy, renderer, and parse-block command contract package consumed by preset and shells.

### Modified Capabilities

- `core-bootstrap`: Core remains syntax-blind; no morph registry construction or parse-block command registration in `createEditor`.
- `editor-orchestration`: Preset/plugin owns `core:parseBlockMarkdown`; editor exposes opaque strategy access only.
- `gfm-preset`: Owns parse-block command registration, morphing registry factory, and public morphing contracts.
- `react-shell`: Focus-switch commit semantics, rendered-host update path, legacy export isolation.
- `vue-shell`: L2 parity with React interaction matrix; morphing-mode showcase without preview.
- `product-experience`: Vue demo and docs must not violate no-preview-panel rule in L2 mode.
- `validation-suite`: Vue interaction tests and optional Playwright coverage; docs/status accuracy.

## Impact

- Packages: `@aether-md/core`, `@aether-md/preset-gfm`, `@aether-md/react`, `@aether-md/vue`, new `@aether-md/morphing-contracts` (or preset re-export), `examples/vue`, `examples/react`, `examples/shared`, `e2e/playwright`.
- **BREAKING**: Primary shell export posture; possible removal of `AetherEditor.morphing` typed accessor; legacy content shell demoted.
- Docs: `docs/project-status.md`, `docs/sdk/react-shell.md`, `examples/vue/README.md`, OpenSpec main spec sync.
- CI: expanded vue tests; optional vue e2e job.
