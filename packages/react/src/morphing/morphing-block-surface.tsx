import { useCallback, useEffect, useRef, type ChangeEvent } from "react";

import type { AetherBlock } from "@aether-md/core";
import type { GfmMorphingBlockStrategy } from "@aether-md/preset-gfm";

import { useAetherEditor } from "../use-aether-editor.js";
import { RenderedBlockHost } from "./rendered-block-host.js";
import { useMorphingFocus } from "./morphing-focus-context.js";

const PARSER_SCHEMA = { version: 1 as const };

export interface MorphingBlockSurfaceProps {
  blockIndex: number;
  block: AetherBlock;
  strategy: GfmMorphingBlockStrategy;
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

  const documentFocused = focusContext !== null && focusContext.focusedBlockIndex === blockIndex;
  const focused = focusContext !== null ? documentFocused : localFocus;

  const sourceText = strategy.serializeSource(block);

  const focusTextarea = useCallback(() => {
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, []);

  const handleFocus = useCallback(() => {
    if (focusContext) {
      focusContext.setFocusedBlockIndex(blockIndex);
    } else {
      onLocalFocusChange?.(true);
    }
    focusTextarea();
  }, [blockIndex, focusContext, focusTextarea, onLocalFocusChange]);

  const handleBlur = useCallback(() => {
    if (focusContext) {
      if (focusContext.focusedBlockIndex === blockIndex) {
        focusContext.setFocusedBlockIndex(null);
      }
    } else {
      onLocalFocusChange?.(false);
    }
  }, [blockIndex, focusContext, onLocalFocusChange]);

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
          const parsed = await editor.context.services.parser.adapter.parse(
            markdown,
            PARSER_SCHEMA,
          );
          return parsed.children[0];
        });

        await editor.dispatch({
          id: "core:replaceText",
          payload: { blockIndex, replacement },
        });
      })();
    },
    [editor, blockIndex, strategy],
  );

  return (
    <div
      data-testid={`morphing-block-${blockIndex}`}
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
