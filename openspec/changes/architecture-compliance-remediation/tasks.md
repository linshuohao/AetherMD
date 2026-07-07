## 1. Wave 1 — Interaction & Demo Fixes (parallel)

- [x] 1.1 React: inter-block focus commit + `RenderedBlockHost` update path (`W1-A`)
- [x] 1.2 Vue: morphing autofocus, blur await in-flight edits (`W1-B`)
- [x] 1.3 Vue: remove `MarkdownPreview` from morphing showcase; update README L1/L2 (`W1-B`)
- [x] 1.4 Remove deprecated preset APIs (`renderParagraphFromBlock`, `GfmMorphingBlockStrategy`) (`W1-C`)
- [x] 1.5 Fix docs drift (`project-status`, `react-shell.md`, vue content comments) (`W1-C`)
- [x] 1.6 Vue: port interaction-matrix tests + prosemirror-view boundary guard (`W1-D`)

## 2. Wave 2 — Morphing Contracts Package (serial gate)

- [x] 2.1 Scaffold `@aether-md/morphing-contracts` package
- [x] 2.2 Migrate preset/react/vue to import contracts; delete duplicate `contracts.ts` copies
- [x] 2.3 Update package-boundary tests for allowed morphing-contracts imports

## 3. Wave 3 — Core Extraction (depends Wave 2)

- [x] 3.1 Move `core:parseBlockMarkdown` registration to `createGfmPreset()`
- [x] 3.2 Remove Core `registerBuiltinEditorCommands` and internal morph DOM types
- [x] 3.3 Make `AetherEditor.morphing` opaque; update editor tests

## 4. Wave 4 — Legacy Isolation & Wiring (parallel after W3)

- [x] 4.1 Demote legacy `AetherEditorContent` export posture (subpath or docs-only primary)
- [x] 4.2 Evaluate optional `plugin-prosemirror` peer for morphing-only consumers → **T17**
- [x] 4.3 Fix GFM wiring stub `dependsOn` hack; manifest `interactiveRenderers` consume or remove → **T18**

## 5. Wave 5 — Validation & Spec Sync (barrier)

- [x] 5.1 Add Vue Playwright e2e subset
- [x] 5.2 Run `pnpm check` + compliance review
- [x] 5.3 Sync OpenSpec main specs via `openspec-sync-specs` → **T20**

## 6. Wave 6 — Audit Residual Remediation

### 6A — Parallel (disjoint files)

- [x] 6.1 Vue `RenderedBlockHost` identity-aware update/remount parity with React (**T14**)
- [x] 6.2 Docs drift: README, examples matrix, E2E counts, vue-shell stub (**T15**)
- [x] 6.3 Vue E2E parity: port React scenarios A/B, Slice B, GateLock (**T16**)
- [x] 6.4 Vue unit tests: Slice D, block-identity, rendered-host (**T21**)
- [x] 6.5 React focus FSM same-block early return guards (**T22**)

### 6B — Core & Preset (serial after 6A merge)

- [x] 6.6 Core: remove `resolveMorphingRegistry` / delete `morphing/types.ts` duplicate (**T13**)
- [x] 6.7 interactiveRenderers: wire bootstrap or remove dead manifest field (**T18**)
- [x] 6.8 Preset: consolidate dual registry (`getGfmMorphingStrategy` vs contracts registry) (**T19**)

### 6C — Packaging & Wiring

- [x] 6.9 Legacy subpath export + optional `plugin-prosemirror` peer (**T17**)
- [x] 6.10 GFM wiring centralization via `@aether-md/example-shared` (**T23**)

### 6D — Barrier

- [x] 6.11 OpenSpec main spec sync + full `pnpm check` (**T20**)
