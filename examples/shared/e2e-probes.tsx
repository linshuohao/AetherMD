import { useCallback, useEffect, useRef, useState } from "react";

import type { AetherEditor } from "@aether-md/core";
import { useAetherEditor } from "@aether-md/react";

declare global {
  interface Window {
    __AETHER_E2E__?: {
      moveBlock: (blockId: string, toIndex: number) => Promise<void>;
    };
  }
}

interface E2EProbesProps {
  /** When omitted, markdown is read from `useAetherEditor()`. */
  markdown?: string;
  /** Expose `window.__AETHER_E2E__.moveBlock` for morphing e2e. */
  enableMoveBlock?: boolean;
}

export function E2EProbes({ markdown: markdownProp, enableMoveBlock = false }: E2EProbesProps) {
  const { markdown: editorMarkdown, ready, editor } = useAetherEditor();
  const markdown = markdownProp ?? editorMarkdown;
  const editorRef = useRef<AetherEditor | null>(null);
  const [editorStable, setEditorStable] = useState(true);

  useEffect(() => {
    if (!ready || !editor) {
      return;
    }
    if (editorRef.current !== null && editorRef.current !== editor) {
      setEditorStable(false);
    }
    editorRef.current = editor;
  }, [ready, editor]);

  useEffect(() => {
    if (!enableMoveBlock || !editor) {
      delete window.__AETHER_E2E__;
      return;
    }

    window.__AETHER_E2E__ = {
      moveBlock: async (blockId: string, toIndex: number) => {
        await editor.dispatch({
          id: "core:moveBlock",
          payload: { blockId, toIndex },
        });
      },
    };

    return () => {
      delete window.__AETHER_E2E__;
    };
  }, [enableMoveBlock, editor]);

  return (
    <div
      data-testid="e2e-probes"
      hidden
      data-markdown={markdown}
      data-ready={ready ? "true" : "false"}
      data-editor-stable={editorStable ? "true" : "false"}
    />
  );
}

export function MoveListBlockButton() {
  const { editor, ready } = useAetherEditor();

  const moveListBlockDown = useCallback(async () => {
    if (!editor) {
      return;
    }
    const listBlock = document.querySelector('[data-block-type="list"]');
    const blockId = listBlock?.getAttribute("data-block-id");
    if (!blockId) {
      return;
    }
    await editor.dispatch({
      id: "core:moveBlock",
      payload: { blockId, toIndex: 2 },
    });
  }, [editor]);

  return (
    <button
      type="button"
      className="e2e-toolbar-button"
      data-testid="move-list-block-down"
      disabled={!ready || !editor}
      onClick={() => {
        void moveListBlockDown();
      }}
    >
      Move list block down (E2E)
    </button>
  );
}

export function ParentRerenderButton({
  renderCount,
  onRerender,
}: {
  renderCount: number;
  onRerender: () => void;
}) {
  return (
    <button
      type="button"
      className="e2e-toolbar-button"
      data-testid="force-parent-rerender"
      onClick={onRerender}
    >
      Force parent rerender ({renderCount})
    </button>
  );
}
