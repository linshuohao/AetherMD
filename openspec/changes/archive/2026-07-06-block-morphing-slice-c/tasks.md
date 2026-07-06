## 1. Design + block helpers

- [x] 1.1 `paragraphSourceFromBlock` / `renderParagraphFromBlock` in Shell morphing module
- [x] 1.2 Refactor `AetherMorphingContent` to use per-block `doc` source

## 2. Document-level focus

- [x] 2.1 `MorphingFocusProvider` + `focusedBlockIndex` context
- [x] 2.2 `AetherMorphingDocument` multi-block surface orchestration

## 3. Integration tests

- [x] 3.1 Scenario C: only focused block is source
- [x] 3.2 Focus switch A→B; edit B does not reset A
- [x] 3.3 Slice A A/B regression + zero remount

## 4. Example + docs

- [x] 4.1 Update `examples/block-morphing` multi-paragraph demo
- [x] 4.2 Sync roadmap, project-status, README, mvp-implementation-plan

## 5. Validation + archive

- [x] 5.1 `openspec validate block-morphing-slice-c --strict` + `pnpm check`
- [x] 5.2 Compliance review, archive, main spec sync
