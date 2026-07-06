import { createEditor, type AetherDoc, type AetherEditor } from "@aether-md/core";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

import { AetherEditorContext } from "./context.js";
import { shouldApplyControlledValue } from "./gate-lock.js";
import type { AetherEditorRootProps } from "./types.js";

function createChangeHandler(
  editor: AetherEditor,
  setMarkdown: (value: string) => void,
  setDoc: (value: AetherDoc) => void,
  prevControlledRef: RefObject<string | undefined>,
  isControlled: boolean,
  onChange?: (markdown: string) => void,
) {
  return editor.on("change", async () => {
    const nextMarkdown = await editor.getMarkdown();
    const nextDoc = editor.getDocument();
    setMarkdown(nextMarkdown);
    setDoc(nextDoc);
    if (isControlled) {
      prevControlledRef.current = nextMarkdown;
    }
    onChange?.(nextMarkdown);
  });
}

export function AetherEditorRoot({
  plugins,
  initialValue,
  value,
  markdown,
  onChange,
  readOnly = false,
  children,
}: AetherEditorRootProps) {
  const controlledValue = value ?? markdown;

  const [editor, setEditor] = useState<AetherEditor | null>(null);
  const [shellMarkdown, setShellMarkdown] = useState("");
  const [doc, setDoc] = useState<AetherDoc | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const prevControlledRef = useRef<string | undefined>(undefined);
  const isControlled = controlledValue !== undefined;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const pluginsKey = plugins.map((plugin) => plugin.manifest.metadata.name).join("|");

  const disposeEditor = useCallback(async (instance: AetherEditor | null) => {
    if (instance) {
      await instance.dispose();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let activeEditor: AetherEditor | null = null;
    let unsubscribe: (() => void) | undefined;

    async function mountEditor() {
      setReady(false);
      setError(null);

      const mountInitial = controlledValue !== undefined ? controlledValue : initialValue;

      const created = await createEditor({
        plugins,
        ...(mountInitial !== undefined ? { initialValue: mountInitial } : {}),
        readOnly,
      });

      if (cancelled) {
        await created.dispose();
        return;
      }

      activeEditor = created;
      const nextMarkdown = await created.getMarkdown();
      const nextDoc = created.getDocument();

      setEditor(created);
      setShellMarkdown(nextMarkdown);
      setDoc(nextDoc);
      setReady(true);
      prevControlledRef.current = controlledValue !== undefined ? controlledValue : nextMarkdown;

      unsubscribe = createChangeHandler(
        created,
        setShellMarkdown,
        setDoc,
        prevControlledRef,
        isControlled,
        (next) => onChangeRef.current?.(next),
      );
    }

    void mountEditor();

    return () => {
      cancelled = true;
      unsubscribe?.();
      void disposeEditor(activeEditor);
      setEditor(null);
      setReady(false);
      setDoc(null);
      setShellMarkdown("");
    };
  }, [pluginsKey, initialValue, readOnly, disposeEditor]);

  useEffect(() => {
    if (!editor || !ready || controlledValue === undefined) {
      return;
    }

    if (!shouldApplyControlledValue(prevControlledRef.current, controlledValue)) {
      return;
    }

    if (prevControlledRef.current === undefined) {
      prevControlledRef.current = controlledValue;
      return;
    }

    let cancelled = false;

    void (async () => {
      prevControlledRef.current = controlledValue;
      await disposeEditor(editor);

      if (cancelled) {
        return;
      }

      const recreated = await createEditor({
        plugins,
        initialValue: controlledValue,
        readOnly,
      });

      if (cancelled) {
        await recreated.dispose();
        return;
      }

      const nextMarkdown = await recreated.getMarkdown();
      setEditor(recreated);
      setShellMarkdown(nextMarkdown);
      setDoc(recreated.getDocument());
      setReady(true);

      const unsubscribe = createChangeHandler(
        recreated,
        setShellMarkdown,
        setDoc,
        prevControlledRef,
        isControlled,
        (next) => onChangeRef.current?.(next),
      );

      return () => {
        unsubscribe();
      };
    })();

    return () => {
      cancelled = true;
    };
  }, [controlledValue, editor, ready, pluginsKey, readOnly, disposeEditor]);

  const contextValue = {
    editor,
    markdown: shellMarkdown,
    doc,
    ready,
    error,
  };

  return (
    <AetherEditorContext.Provider value={contextValue}>{children}</AetherEditorContext.Provider>
  );
}
