import type { ParagraphBlock } from "@aether-md/core";

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

  const paragraphBlocks = doc.children
    .map((block, index) => ({ block, index }))
    .filter(
      (entry): entry is { block: ParagraphBlock; index: number } =>
        entry.block.type === "paragraph",
    );

  return (
    <MorphingFocusProvider>
      <div
        data-testid="aether-morphing-document"
        data-ready="true"
        className="aether-morphing-document"
      >
        {paragraphBlocks.map(({ block, index }) => (
          <MorphingBlockSurface
            key={index}
            blockIndex={index}
            block={block}
          />
        ))}
      </div>
    </MorphingFocusProvider>
  );
}
