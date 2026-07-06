import type { AetherBlock } from "@aether-md/core";
import { getGfmMorphingStrategy } from "@aether-md/preset-gfm";

import { useAetherEditor } from "./use-aether-editor.js";
import { MorphingBlockSurface } from "./morphing/morphing-block-surface.js";
import { MorphingFocusProvider } from "./morphing/morphing-focus-context.js";

export function AetherMorphingDocument() {
  const { ready, doc } = useAetherEditor();

  if (!ready || !doc) {
    return (
      <div data-testid="aether-morphing-document" data-ready="false">
        Loading…
      </div>
    );
  }

  const morphingBlocks = doc.children
    .map((block, index) => ({ block, index }))
    .filter((entry): entry is { block: AetherBlock; index: number } => {
      return getGfmMorphingStrategy(entry.block.type) !== undefined;
    });

  return (
    <MorphingFocusProvider>
      <div
        data-testid="aether-morphing-document"
        data-ready="true"
        className="aether-morphing-document"
      >
        {morphingBlocks.map(({ block, index }) => {
          const strategy = getGfmMorphingStrategy(block.type)!;
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
