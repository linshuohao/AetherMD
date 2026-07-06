## 1. Preset headless serialize

- [x] 1.1 Add `gfm-inline-morphing.ts` with `serializeParagraphInlines` + tests
- [x] 1.2 Export from `@aether-md/preset-gfm`; document `interactiveRenderers` stub on manifest

## 2. React morphing render + dispatch

- [x] 2.1 Fix `renderParagraphFromBlock` (`<em>` for emphasis); react imports preset serialize
- [x] 2.2 `MorphingBlockSurface`: `renderParagraphFromBlock` + parser-backed `onChange` with `children`

## 3. Integration tests

- [x] 3.1 Slice B: emphasis focus source, blurred `<em>`, source edit preserves marks
- [x] 3.2 Slice A/C regression unchanged

## 4. Example + docs

- [x] 4.1 Update `examples/block-morphing` fixture + README (Slice B)
- [x] 4.2 `docs/sdk/manifest.md` cross-link; project-status / roadmap Slice B ✅

## 5. Validation barrier

- [x] 5.1 `pnpm check` + `openspec validate block-morphing-slice-b --strict`
- [x] 5.2 compliance review + archive + main spec sync
