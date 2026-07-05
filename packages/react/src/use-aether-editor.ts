import { useContext, useEffect, useState } from "react";

import { AetherEditorContext } from "./context.js";
import type { UseAetherEditorResult } from "./types.js";

export function useAetherEditor(): UseAetherEditorResult {
  const context = useContext(AetherEditorContext);

  if (context === null) {
    throw new Error("useAetherEditor must be used within AetherEditorRoot");
  }

  const [markdown, setMarkdown] = useState(context.markdown);
  const [doc, setDoc] = useState(context.doc);

  useEffect(() => {
    setMarkdown(context.markdown);
    setDoc(context.doc);
  }, [context.markdown, context.doc]);

  useEffect(() => {
    const editor = context.editor;
    if (!editor) {
      return;
    }

    const unsubscribe = editor.on("change", async () => {
      setDoc(editor.getDocument());
      setMarkdown(await editor.getMarkdown());
    });

    return unsubscribe;
  }, [context.editor]);

  return {
    editor: context.editor,
    markdown,
    doc,
    ready: context.ready,
    error: context.error,
  };
}
