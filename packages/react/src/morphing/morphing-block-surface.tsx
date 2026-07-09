import { type AetherBlock } from "@aether-md/core/document";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

import { useAetherEditor } from "../shell/use-aether-editor.js";
import { PARSE_BLOCK_MARKDOWN_COMMAND, type MorphingBlockStrategy } from "./contracts.js";
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
  const changeRevisionRef = useRef(0);
  const inFlightEditRef = useRef<Promise<void> | null>(null);
  const [draftSource, setDraftSource] = useState<string | null>(null);
  const [pendingEdits, setPendingEdits] = useState(0);

  const documentFocused = focusContext !== null && focusContext.focusedBlockId === blockId;
  const focused = focusContext !== null ? documentFocused : localFocus;

  const serializedSource = strategy.serializeSource(block);
  const sourceText = focused && draftSource !== null ? draftSource : serializedSource;

  const commitFocus = useCallback(async () => {
    if (inFlightEditRef.current) {
      await inFlightEditRef.current;
    }
  }, []);

  useEffect(() => {
    if (!focusContext) {
      return;
    }
    return focusContext.registerFocusCommit(blockId, commitFocus);
  }, [blockId, commitFocus, focusContext]);

  const handleFocus = useCallback(() => {
    if (focusContext) {
      if (focusContext.focusedBlockId === blockId) {
        return;
      }
      focusContext.requestFocus(blockId);
      return;
    }
    onLocalFocusChange?.(true);
  }, [blockId, focusContext, onLocalFocusChange]);

  const handleBlur = useCallback(() => {
    if (focusContext) {
      if (focusContext.focusedBlockId === blockId) {
        focusContext.releaseFocus();
      }
      return;
    }

    void (async () => {
      await commitFocus();
      onLocalFocusChange?.(false);
    })();
  }, [blockId, commitFocus, focusContext, onLocalFocusChange]);

  useEffect(() => {
    if (focused) {
      setDraftSource((previous) => previous ?? serializedSource);
      textareaRef.current?.focus();
      return;
    }
    setDraftSource(null);
  }, [focused, blockId, serializedSource]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      if (!editor) {
        return;
      }

      const rawSource = event.target.value;
      setDraftSource(rawSource);
      const revision = ++changeRevisionRef.current;

      const editPromise = (async () => {
        setPendingEdits((count) => count + 1);
        try {
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

          if (revision !== changeRevisionRef.current) {
            return;
          }

          await editor.dispatch({
            id: "core:replaceText",
            payload: { blockId, replacement },
          });
        } finally {
          setPendingEdits((count) => Math.max(0, count - 1));
        }
      })();

      inFlightEditRef.current = editPromise;
      void editPromise.finally(() => {
        if (inFlightEditRef.current === editPromise) {
          inFlightEditRef.current = null;
        }
      });
    },
    [editor, blockId, strategy],
  );

  return (
    <div
      data-testid={`morphing-block-${blockIndex}`}
      data-block-id={blockId}
      data-block-type={block.type}
      data-focused={focused ? "true" : "false"}
      data-pending-edits={pendingEdits}
      data-edit-synced={pendingEdits === 0 ? "true" : "false"}
      className="aether-morphing-block"
    >
      {focused ? (
        <textarea
          ref={textareaRef}
          data-testid="morphing-source"
          className="aether-morphing-source"
          aria-label={`Edit block ${blockIndex} source`}
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
