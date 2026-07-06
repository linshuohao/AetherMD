import { useState } from "react";

import type { ParagraphBlock } from "@aether-md/core";

import { useAetherEditor } from "./use-aether-editor.js";
import { MorphingBlockSurface } from "./morphing/morphing-block-surface.js";

export interface AetherMorphingContentProps {
  /** Document block index; Slice A defaults to single paragraph at 0. */
  blockIndex?: number;
}

export function AetherMorphingContent({
  blockIndex = 0,
}: AetherMorphingContentProps) {
  const { ready, doc } = useAetherEditor();
  const [focused, setFocused] = useState(false);

  if (!ready || !doc) {
    return (
      <div data-testid="aether-morphing-content" data-ready="false">
        Loading…
      </div>
    );
  }

  const block = doc.children[blockIndex];
  if (!block || block.type !== "paragraph") {
    return (
      <div data-testid="aether-morphing-content" data-ready="true">
        <p>Unsupported block at index {blockIndex}</p>
      </div>
    );
  }

  return (
    <div
      data-testid="aether-morphing-content"
      data-ready="true"
      data-focused={focused ? "true" : "false"}
    >
      <MorphingBlockSurface
        blockIndex={blockIndex}
        block={block as ParagraphBlock}
        localFocus={focused}
        onLocalFocusChange={setFocused}
      />
    </div>
  );
}
