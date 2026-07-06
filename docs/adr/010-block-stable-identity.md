# ADR 010: Stable Block Identity

| Field         | Value      |
| ------------- | ---------- |
| Status        | Accepted   |
| Date          | 2026-07-06 |
| Supersedes    | —          |
| Superseded by | —          |

## Context

L2 Block Focus and Instant Morphing require that non-focused blocks are not reset or remounted when the document structure changes. The product experience spec treats stable block survival as a north star.

The React Shell currently keys morphing surfaces by array index and routes `core:replaceText` by `blockIndex`. Index-based coordinates are fragile under insert, delete, reorder, and undo/redo. `docs/architecture/document-model.md` left “whether all nodes need stable ids” as an open question.

Slice A–D integration tests validate focus and edit semantics for in-place text changes but do not cover structural edits.

## Decision

1. **Top-level document blocks** (`AetherDoc.children`) **MUST** carry a stable string `id` after editor normalization.
2. **Id format:** opaque string prefixed `blk_` + UUID (generated via `crypto.randomUUID()`).
3. **Assignment:** Parser adapters assign ids on parse; `createEditor` runs `ensureDocumentBlockIds()` on the initial document; engine round-trip preserves ids through ProseMirror block `blockId` attrs.
4. **Wire format:** Markdown serialization **MUST NOT** embed block ids (ids are session-local, not round-tripped through Markdown).
5. **Commands:** `core:replaceText` payload **MAY** use `blockId` instead of `blockIndex`; when both are present, `blockId` wins. Replacement blocks inherit the target block id.
6. **Shell:** React morphing components **MUST** use `block.id` as React `key` and track Block Focus by `blockId`, not array index.

Nested blocks inside list items **MAY** omit ids in v1; only `doc.children` coordinates are stabilized.

## Trade-offs

| Benefit                                  | Cost                                                    |
| ---------------------------------------- | ------------------------------------------------------- |
| Focus and DOM state survive reorder      | PM schema attrs + conversion changes                    |
| Command bus ready for insert/delete/undo | Parser/engine must preserve ids on apply                |
| Clear product ↔ model alignment          | Markdown re-parse generates new ids (acceptable for M7) |

Alternatives rejected:

- **Index-only coordinates** — insufficient for north star; already failing future structural edits.
- **Markdown-embedded ids** — pollutes wire format and user-visible source.

## Consequences

- `@aether-md/core` exports block-id helpers and extends block types with optional `id`.
- `@aether-md/plugin-remark` assigns ids at parse time for top-level blocks.
- `@aether-md/plugin-prosemirror` stores `blockId` on block nodes and preserves ids on `replaceText`.
- `@aether-md/react` morphing focus context migrates from `focusedBlockIndex` to `focusedBlockId`.
- Future insert/delete commands should target `blockId` first-class.
- Tests should cover id-stable `replaceText` after child reorder and focus retention keyed by id.
