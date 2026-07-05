import type { AdapterCommandRequest } from "@aether-md/core";
import {
  createProseMirrorView,
  refreshProseMirrorViewFromSession,
} from "@aether-md/plugin-prosemirror";
import { useEffect, useRef } from "react";

import { useAetherEditor } from "./use-aether-editor.js";

export function AetherEditorContent() {
  const { editor, ready } = useAetherEditor();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor || !ready || !containerRef.current) {
      return;
    }

    const session = editor.context.services.engine.session;
    const handle = createProseMirrorView({
      session,
      dom: containerRef.current,
      dispatchInput: (request: AdapterCommandRequest) => {
        void editor.dispatch({
          id: "core:replaceText",
          payload: {
            blockIndex: request.blockIndex,
            text: request.text,
          },
        });
      },
    });

    const unsubscribe = editor.on("change", () => {
      refreshProseMirrorViewFromSession(handle, session);
    });

    return () => {
      unsubscribe();
      handle.destroy();
    };
  }, [editor, ready]);

  return <div ref={containerRef} data-testid="aether-editor-content" />;
}
