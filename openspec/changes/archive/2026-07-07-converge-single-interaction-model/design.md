## Context

AetherMD has completed both L1 Phase-0 shell plumbing and L2 morphing slices, but implementation and specs still expose dual interaction tracks as co-equal product surfaces. Core also contains morphing/Markdown-specific contracts that should live in preset/plugin layers under the microkernel charter.

Current drift appears in four places:

- product surface drift (L1 `AetherEditorContent` still first-class beside L2 morphing),
- kernel boundary drift (Core exports morphing + DOM contracts and handles block-markdown parse command directly),
- workflow artifact drift (legacy example names and stale references),
- validation drift (insufficient keyboard deletion/input matrix on the north-star path).

## Goals / Non-Goals

**Goals:**

- Establish one product interaction contract: block-morphing shell path as default and normative.
- Restore Core boundary purity: lifecycle + command/event + orchestration without morphing/DOM ownership.
- Move morphing contracts and block-markdown parsing responsibilities to preset/plugin command registration.
- Align React and Vue shell public surfaces to the same interaction model.
- Synchronize docs/OpenSpec/example topology and test gates with the converged model.

**Non-Goals:**

- No new collaborative editing model.
- No rewrite of adapter engines (remark/prosemirror internals remain in plugin packages).
- No immediate M7 publish in this change.

## Decisions

1. **Single interaction model by contract**
   - Product-facing examples, docs, and acceptance tests SHALL treat morphing document flow as the only product interaction model.
   - Legacy whole-document content shell paths MAY remain only as explicitly scoped pipeline/dev utilities, not as co-equal product API.

2. **Core morphing surface extraction**
   - Remove morphing-specific contracts (`MorphingBlockStrategy`, `CustomBlockRenderer`, parse-block-markdown command types) from Core public API.
   - Preset/plugin layers own morphing strategy and renderer contracts; shell consumes those contracts.

3. **Unified command routing**
   - Editor command handling SHALL use registered handlers through the command runtime pipeline.
   - Hardcoded Core special-case handling for block-markdown parse SHALL be replaced by preset/plugin command registration.

4. **Single bootstrap/orchestration validation path**
   - Manifest load/validate/order checks run once in the canonical startup flow.
   - Remove duplicate pre-bootstrap checks from `createEditor` where `bootstrapCore` already guarantees behavior.

5. **Convergence-first cleanup**
   - Remove dead/stale files and stale references in docs/spec/test naming before adding new functionality.
   - Keep behavior changes traceable via capability deltas and per-task validation records.

## Risks / Trade-offs

- **[Public API break risk]** Removing/relocating shell/core exports can break local consumers → Mitigation: mark deprecations first, add migration notes, run consumer smoke checks.
- **[Runtime regression risk]** Routing parse commands through plugin registration may break morphing edit flow → Mitigation: add targeted unit/integration tests before switching wiring.
- **[Cross-package sequencing risk]** Core, preset, react, vue updates are tightly coupled → Mitigation: execute task order with strict barriers and per-wave validation.
- **[Spec drift risk]** Large capability sweep can desync docs/specs → Mitigation: update delta specs and docs in the same change; run compliance review before archive.

## Migration Plan

1. Clean stale example/test topology and references.
2. Introduce converged shell contract deltas and migration notes.
3. Extract morphing/DOM contracts out of Core; rewire preset/plugin ownership.
4. Replace parse command hardcoding with registered command handlers.
5. Align React and Vue exports/components to converged shell surface.
6. Expand keyboard-focused interaction validation matrix.
7. Sync docs and main specs; archive with deviation log (if any).
