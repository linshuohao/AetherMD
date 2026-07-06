import { useCallback, useEffect, useRef, type ChangeEvent } from "react";

import type { AetherBlock, MorphingBlockStrategy } from "@aether-md/core";
import { PARSE_BLOCK_MARKDOWN_COMMAND } from "@aether-md/core";

import { useAetherEditor } from "../shell/use-aether-editor.js";
import { RenderedBlockHost } from "./rendered-block-host.js";
import { useMorphingFocus } from "./morphing-focus-context.js";

export interface MorphingBlockSurfaceProps {
  blockIndex: number;
  block: AetherBlock;
  strategy: MorphingBlockStrategy;
  /** Local focus mode when not inside MorphingFocusProvider. */
  localFocus?: boolean;
  onLocalFocusChange?: (focused: boolean) => void;
}

export function MorphingBlockSurface({
  blockIndex,
  block,
  strategy,
  localFocus = false,
  onLocalFocusChange,
}: MorphingBlockSurfaceProps) {
  const { editor } = useAetherEditor();
  const focusContext = useMorphingFocus();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const blockId = block.id ?? String(blockIndex);

  const documentFocused = focusContext !== null && focusContext.focusedBlockId === blockId;
  const focused = focusContext !== null ? documentFocused : localFocus;

  const sourceText = strategy.serializeSource(block);

  const focusTextarea = useCallback(() => {
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, []);

  const handleFocus = useCallback(() => {
    if (focusContext) {
      focusContext.setFocusedBlockId(blockId);
    } else {
      onLocalFocusChange?.(true);
    }
    focusTextarea();
  }, [blockId, focusContext, focusTextarea, onLocalFocusChange]);

  const handleBlur = useCallback(() => {
    if (focusContext) {
      if (focusContext.focusedBlockId === blockId) {
        focusContext.setFocusedBlockId(null);
      }
    } else {
      onLocalFocusChange?.(false);
    }
  }, [blockId, focusContext, onLocalFocusChange]);

  useEffect(() => {
    if (focused) {
      focusTextarea();
    }
  }, [focused, focusTextarea]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      if (!editor) {
        return;
      }

      const rawSource = event.target.value;
      void (async () => {
        const replacement = await strategy.parseSource(rawSource, async (markdown) => {
          const result = await editor.dispatch({
            id: PARSE_BLOCK_MARKDOWN_COMMAND,
            payload: { markdown },
          });
          if (!result.ok) {
            return undefined;
          }
          return result.value as AetherBlock | undefined;
        });

        await editor.dispatch({
          id: "core:replaceText",
          payload: { blockId, replacement },
        });
      })();
    },
    [editor, blockId, strategy],
  );

  return (
    <div
      data-testid={`morphing-block-${blockIndex}`}
      data-block-id={blockId}
      data-block-type={block.type}
      data-focused={focused ? "true" : "false"}
      className="aether-morphing-block"
    >
      {focused ? (
        <textarea
          ref={textareaRef}
          data-testid="morphing-source"
          className="aether-morphing-source"
          value={sourceText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          rows={strategy.blockType === "list" ? 4 : 3}
          spellCheck={false}
        />
      ) : (
        <RenderedBlockHost
          block={block}
          renderer={strategy.interactiveRenderer}
          onFocus={handleFocus}
        />
      )}
    </div>
  );
}
