import { useEffect, useRef, useState } from "react";

import type { AetherEditor } from "@aether-md/core";
import { useAetherEditor } from "@aether-md/react";

export function E2EProbes() {
  const { markdown, ready, editor } = useAetherEditor();
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
