## Context

Slice A (`AetherMorphingContent`) morphs a single paragraph using whole-document `markdown` as source text. Multi-block documents require per-block source serialization from `AetherDoc.children[blockIndex]` and document-level focus so at most one block is in source state (product-experience 场景 C).

Constraints unchanged from Slice A: Core MUST NOT add morphing branches; Shell owns focus state machine; PM not used on morphing path; GateLock semantics preserved.

## Goals / Non-Goals

**Goals:**

- 2+ paragraph fixture: focus block B → only B shows `morphing-source` textarea; A/C show `morphing-rendered`.
- Focus switch A→B: A morphs to rendered before/synchronously with B entering source; no two source surfaces visible.
- Editing block B does not reset block A content.
- Slice A scenarios A/B regression with `AetherMorphingContent` (single block).
- Zero editor remount on consecutive edits and parent rerender.
- `examples/block-morphing` multi-paragraph demo.

**Non-Goals:**

- Heading/list blocks (Slice D), full GFM mark fidelity (Slice B), M7 publish.

## Decisions

### 1. Block-level source: serialize `ParagraphBlock.children` in Shell

**选择：** Add `paragraphSourceFromBlock(block: ParagraphBlock)` and `renderParagraphFromBlock(block)` in `packages/react/src/morphing/paragraph-render.tsx`. Inline serialization mirrors remark serializer subset: `text`, `mark/strong` → `**`；other marks as plain text fallback for MVP.

**理由：** Stops using whole `markdown` as single-block source; no Core/remark dependency in Shell render path.

### 2. Document-level focus: `MorphingFocusProvider` + `focusedBlockIndex`

**选择：** `AetherMorphingDocument` wraps `MorphingFocusProvider` with `focusedBlockIndex: number | null`. Each block surface reads context; only `focusedBlockIndex === blockIndex` renders textarea.

**理由：** Enforces at-most-one source state across blocks; `AetherMorphingContent` keeps local `focused` boolean for standalone single-block use.

### 3. Component shape: additive `AetherMorphingDocument`

**选择：** `AetherMorphingDocument` maps `doc.children` (paragraph blocks only in Slice C fixtures) to internal `MorphingBlockSurface` shared with `AetherMorphingContent`. `blockIndex` = index in `doc.children`.

**理由:** Additive API; Slice A tests keep using `AetherMorphingContent`.

### 4. Edit path unchanged

**选择：** `editor.dispatch({ id: 'core:replaceText', payload: { blockIndex, text } })` per block.

### 5. Test fixtures

**选择：** `SLICE_C_FIXTURE = "First **one**\n\nSecond **two**\n\nThird plain\n"`; scenario C uses `AetherMorphingDocument`.

## Risks / Mitigations

| 风险                        | 缓解                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------- |
| Non-paragraph blocks in doc | Slice C fixtures paragraph-only; non-paragraph children skipped in document mapper |
| Focus race on rapid click   | Single `focusedBlockIndex` state; conditional render prevents dual textarea        |

## Open Questions

（无 — 已拍板。）
