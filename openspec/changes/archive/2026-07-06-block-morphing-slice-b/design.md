## Context

Slice A/C morph paragraphs with strong-only regex render and `replaceText` without `children`, stripping emphasis/link on edit. Slice B migrates rendered output to `AetherDoc` / `AetherInline` tree and preserves marks on source edit via parser-backed dispatch.

Constraints: Core MUST NOT add morphing branches; Shell owns focus state machine; PM not used on morphing path; no M7 publish.

## Goals / Non-Goals

**Goals:**

- Rendered state: `<strong>`, `<em>`, `<a href>` from `renderParagraphFromBlock(block)`.
- Source state: `paragraphSourceFromBlock` serializes strong/emphasis/link (via preset headless module).
- Source edit: `onChange` parses markdown through `editor.context.services.parser.adapter.parse`, dispatches `core:replaceText` with `text` + `children`.
- Preset exports headless serialize; React consumes; manifest documents `interactiveRenderers` stub.
- Slice A/C regression green; ≥3 Slice B integration tests.

**Non-Goals:**

- Slice D blocks; full `interactiveRenderers` DOM registration; M7 publish.

## Decisions

### 1. Parser-on-change for source edits

**选择：** On textarea `change`, wrap value as single paragraph (`${rawSource}\n`), `await editor.context.services.parser.adapter.parse(...)`, take `doc.children[0]` when `type === "paragraph"`, dispatch:

```ts
editor.dispatch({
  id: "core:replaceText",
  payload: { blockIndex, text: rawSource, children: parsedParagraph.children },
});
```

**理由：** Engine already supports optional `children` (`plugin-prosemirror/engine.ts`); remark parser round-trips GFM inline marks; satisfies zero-latency typing without stripping sigils.

### 2. Preset headless serialize module

**选择：** Add `packages/preset-gfm/src/gfm-inline-morphing.ts` with `serializeInlineToMarkdown` and `serializeParagraphInlines(block: ParagraphBlock): string`. Export from `@aether-md/preset-gfm` subpath `./inline-morphing` (or main index re-export). `@aether-md/react` imports serialize; removes duplicate logic from `paragraph-render.tsx`.

**理由:** Headless contract for future pluginization; no React in preset; types depend only on `@aether-md/core`.

### 3. Rendered path: `renderParagraphFromBlock` only

**选择:** `MorphingBlockSurface` blurred branch calls `renderParagraphFromBlock(block)` — never `renderParagraphInline`. Fix `renderInline` to emit `<em>` for `mark/emphasis`.

**理由:** Tree-based render matches serializer/parser; regex path deprecated for morphing.

### 4. Manifest `interactiveRenderers` stub

**选择:** Add JSDoc on `gfmManifest` noting `interactiveRenderers` reserved for Slice D block renderers; one sentence cross-link in `docs/sdk/manifest.md`.

### 5. Test fixtures

**选择:** `SLICE_B_FIXTURE = "Hello **bold** and *emphasis* with [link](https://example.com).\n"` for `AetherMorphingContent`; multi-block smoke optional in `AetherMorphingDocument`.

## Risks / Mitigations

| 风险                            | 缓解                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Parse latency on each keystroke | Single-paragraph parse; async dispatch; existing Slice A/C edit path already dispatches per change |
| Non-paragraph parse result      | Fallback to text-only `children: [{ type: "text", text: rawSource }]` if first child not paragraph |
| Nested marks                    | remark parser + recursive `renderInline` handle nesting                                            |

## Open Questions

（无 — 已拍板。）
