import { useState } from "react";

import type { AetherBlock } from "@aether-md/core";

import { useAetherEditor } from "../shell/use-aether-editor.js";
import { MorphingBlockSurface } from "./morphing-block-surface.js";

export interface AetherMorphingContentProps {
  /** Document block index; Slice A defaults to single paragraph at 0. */
  blockIndex?: number;
}

export function AetherMorphingContent({ blockIndex = 0 }: AetherMorphingContentProps) {
  const { ready, doc, editor } = useAetherEditor();
  const [focused, setFocused] = useState(false);

  if (!ready || !doc || !editor) {
    return (
      <div data-testid="aether-morphing-content" data-ready="false">
        Loading…
      </div>
    );
  }

  const block = doc.children[blockIndex];
  const strategy = block ? editor.getMorphingStrategy(block.type) : undefined;

  if (!block || !strategy) {
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
        block={block as AetherBlock}
        strategy={strategy}
        localFocus={focused}
        onLocalFocusChange={setFocused}
      />
    </div>
  );
}
