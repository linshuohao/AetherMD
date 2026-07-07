import type { AetherBlock } from "@aether-md/core";

import { useAetherEditor } from "../shell/use-aether-editor.js";
import type { MorphingBlockStrategy } from "./contracts.js";
import { MorphingBlockSurface } from "./morphing-block-surface.js";
import { MorphingFocusProvider, useMorphingFocus } from "./morphing-focus-context.js";

type AetherEditorInstance = NonNullable<ReturnType<typeof useAetherEditor>["editor"]>;

function MorphingDocumentBody({
  morphingBlocks,
  editor,
}: {
  morphingBlocks: { block: AetherBlock; index: number }[];
  editor: AetherEditorInstance;
}) {
  const focusContext = useMorphingFocus();

  return (
    <div
      data-testid="aether-morphing-document"
      data-ready="true"
      data-focused-block-id={focusContext?.focusedBlockId ?? ""}
      className="aether-morphing-document"
    >
      {morphingBlocks.map(({ block, index }) => {
        const strategy = editor.getMorphingStrategy(block.type) as MorphingBlockStrategy;
        return (
          <MorphingBlockSurface
            key={block.id ?? index}
            blockIndex={index}
            block={block}
            strategy={strategy}
          />
        );
      })}
    </div>
  );
}

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
      <MorphingDocumentBody morphingBlocks={morphingBlocks} editor={editor} />
    </MorphingFocusProvider>
  );
}
