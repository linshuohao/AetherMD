import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import React from "react";

import type { AetherEditor } from "@aether-md/core";

import { AetherEditorContent, AetherEditorRoot, useAetherEditor } from "../index.js";
import { createGfmEditorPlugins } from "../testing/gfm-plugins.js";

function EditorProbe({ onReady }: { onReady: (editor: AetherEditor) => void }) {
  const { editor, ready } = useAetherEditor();

  React.useEffect(() => {
    if (ready && editor) {
      onReady(editor);
    }
  }, [ready, editor, onReady]);

  return null;
}

describe("React Shell integration", () => {
  afterEach(() => {
    cleanup();
  });

  it("mounts, emits onChange through dispatch path, and disposes on unmount", async () => {
    const changes: string[] = [];
    let capturedEditor: AetherEditor | null = null;

    const { unmount } = render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          initialValue: "Hello world\n",
          onChange: (markdown: string) => {
            changes.push(markdown);
          },
        },
        React.createElement(AetherEditorContent),
        React.createElement(EditorProbe, {
          onReady: (editor) => {
            capturedEditor = editor;
          },
        }),
      ),
    );

    await waitFor(() => {
      assert.ok(capturedEditor);
      assert.ok(document.querySelector(".ProseMirror"));
    });

    await act(async () => {
      assert.ok(capturedEditor);
      const result = await capturedEditor.dispatch({
        id: "core:replaceText",
        payload: { blockIndex: 0, text: "Hello AetherMD" },
      });
      assert.equal(result.ok, true);
    });

    await waitFor(() => {
      assert.ok(changes.some((markdown) => markdown.includes("Hello AetherMD")));
    });

    unmount();

    await waitFor(() => {
      assert.equal(document.querySelector(".ProseMirror"), null);
    });
  });

  it("fail-closes dispatch with EDITOR_DISPOSED after Root unmount", async () => {
    let capturedEditor: AetherEditor | null = null;

    const { unmount } = render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          initialValue: "Hello world\n",
        },
        React.createElement(AetherEditorContent),
        React.createElement(EditorProbe, {
          onReady: (editor) => {
            capturedEditor = editor;
          },
        }),
      ),
    );

    await waitFor(() => {
      assert.ok(capturedEditor);
    });

    unmount();

    await waitFor(() => {
      assert.equal(document.querySelector(".ProseMirror"), null);
    });

    await act(async () => {
      assert.ok(capturedEditor);
      const result = await capturedEditor.dispatch({
        id: "core:replaceText",
        payload: { blockIndex: 0, text: "After dispose" },
      });
      assert.equal(result.ok, false);
      assert.equal(result.error?.code, "EDITOR_DISPOSED");
    });
  });
});
