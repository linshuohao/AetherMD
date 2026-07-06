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
  const pendingLocalEditsRef = useRef(0);

  useEffect(() => {
    if (!editor || !ready || !containerRef.current) {
      return;
    }

    const session = editor.context.services.engine.session;
    const handle = createProseMirrorView({
      session,
      dom: containerRef.current,
      dispatchInput: (request: AdapterCommandRequest) => {
        pendingLocalEditsRef.current += 1;
        void editor
          .dispatch({
            id: "core:replaceText",
            payload: {
              blockIndex: request.blockIndex,
              ...(request.children !== undefined ? { children: request.children } : {}),
              ...(request.text !== undefined
                ? { text: request.text }
                : request.children === undefined
                  ? { text: "" }
                  : {}),
            },
          })
          .then((result) => {
            if (!result.ok) {
              pendingLocalEditsRef.current = Math.max(0, pendingLocalEditsRef.current - 1);
            }
          })
          .catch(() => {
            pendingLocalEditsRef.current = Math.max(0, pendingLocalEditsRef.current - 1);
          });
      },
    });

    const unsubscribe = editor.on("change", () => {
      if (pendingLocalEditsRef.current > 0) {
        pendingLocalEditsRef.current -= 1;
        return;
      }
      refreshProseMirrorViewFromSession(handle, session);
    });

    return () => {
      unsubscribe();
      handle.destroy();
    };
  }, [editor, ready]);

  return <div ref={containerRef} data-testid="aether-editor-content" />;
}
