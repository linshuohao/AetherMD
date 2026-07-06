import { useCallback, useEffect, useRef } from "react";

import type { ParagraphBlock } from "@aether-md/core";

import { useAetherEditor } from "../use-aether-editor.js";
import {
  paragraphSourceFromBlock,
  renderParagraphInline,
} from "./paragraph-render.js";
import { useMorphingFocus } from "./morphing-focus-context.js";

export interface MorphingBlockSurfaceProps {
  blockIndex: number;
  block: ParagraphBlock;
  /** Local focus mode when not inside MorphingFocusProvider. */
  localFocus?: boolean;
  onLocalFocusChange?: (focused: boolean) => void;
}

export function MorphingBlockSurface({
  blockIndex,
  block,
  localFocus = false,
  onLocalFocusChange,
}: MorphingBlockSurfaceProps) {
  const { editor } = useAetherEditor();
  const focusContext = useMorphingFocus();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const documentFocused =
    focusContext !== null && focusContext.focusedBlockIndex === blockIndex;
  const focused = focusContext !== null ? documentFocused : localFocus;

  const sourceText = paragraphSourceFromBlock(block);

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
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!editor) {
        return;
      }

      void editor.dispatch({
        id: "core:replaceText",
        payload: { blockIndex, text: event.target.value },
      });
    },
    [editor, blockIndex],
  );

  return (
    <div
      data-testid={`morphing-block-${blockIndex}`}
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
          rows={3}
          spellCheck={false}
        />
      ) : (
        <div
          data-testid="morphing-rendered"
          className="aether-morphing-rendered"
          tabIndex={0}
          onFocus={handleFocus}
          onMouseDown={(event) => {
            event.preventDefault();
            handleFocus();
          }}
        >
          {renderParagraphInline(paragraphSourceFromBlock(block))}
        </div>
      )}
    </div>
  );
}
