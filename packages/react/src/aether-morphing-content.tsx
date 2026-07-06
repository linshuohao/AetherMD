import { useCallback, useEffect, useRef, useState } from "react";

import { useAetherEditor } from "./use-aether-editor.js";
import {
  paragraphSourceFromMarkdown,
  renderParagraphInline,
} from "./morphing/paragraph-render.js";

export interface AetherMorphingContentProps {
  /** Document block index; Slice A defaults to single paragraph at 0. */
  blockIndex?: number;
}

export function AetherMorphingContent({
  blockIndex = 0,
}: AetherMorphingContentProps) {
  const { editor, ready, markdown } = useAetherEditor();
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sourceText = paragraphSourceFromMarkdown(markdown);

  const focusTextarea = useCallback(() => {
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, []);

  const handleFocus = useCallback(() => {
    setFocused(true);
    focusTextarea();
  }, [focusTextarea]);

  const handleBlur = useCallback(() => {
    setFocused(false);
  }, []);

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

      const text = event.target.value;
      void editor.dispatch({
        id: "core:replaceText",
        payload: { blockIndex, text },
      });
    },
    [editor, blockIndex],
  );

  if (!ready) {
    return (
      <div data-testid="aether-morphing-content" data-ready="false">
        Loading…
      </div>
    );
  }

  return (
    <div
      data-testid="aether-morphing-content"
      data-ready="true"
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
          {renderParagraphInline(markdown)}
        </div>
      )}
    </div>
  );
}
