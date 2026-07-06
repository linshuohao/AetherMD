import type { AetherBlock } from "@aether-md/core";

import { useAetherEditor } from "./use-aether-editor.js";
import { MorphingBlockSurface } from "./morphing/morphing-block-surface.js";
import { MorphingFocusProvider } from "./morphing/morphing-focus-context.js";

export function AetherMorphingDocument() {
  const { ready, doc, editor } = useAetherEditor();

  if (!ready || !doc || !editor) {
    return (
      <div data-testid="aether-morphing-document" data-ready="false">
        Loading…
      </div>
    );
  }

  const morphingBlocks = doc.children
    .map((block, index) => ({ block, index }))
    .filter((entry): entry is { block: AetherBlock; index: number } => {
      return editor.getMorphingStrategy(entry.block.type) !== undefined;
    });

  return (
    <MorphingFocusProvider>
      <div
        data-testid="aether-morphing-document"
        data-ready="true"
        className="aether-morphing-document"
      >
        {morphingBlocks.map(({ block, index }) => {
          const strategy = editor.getMorphingStrategy(block.type)!;
          return (
            <MorphingBlockSurface
              key={index}
              blockIndex={index}
              block={block}
              strategy={strategy}
            />
          );
        })}
      </div>
    </MorphingFocusProvider>
  );
}
