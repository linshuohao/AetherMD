import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import React, { useState } from "react";

import type { AetherEditor } from "@aether-md/core";

import { AetherEditorContent, AetherEditorRoot, useAetherEditor } from "../index.js";
import { createGfmEditorPlugins } from "../testing/gfm-plugins.js";

function EditorProbe({ onReady }: { onReady: (editor: AetherEditor) => void }) {
  const { editor, ready, markdown } = useAetherEditor();

  React.useEffect(() => {
    if (ready && editor) {
      onReady(editor);
    }
  }, [ready, editor, onReady]);

  return React.createElement("div", { "data-testid": "markdown-probe" }, markdown);
}

describe("GateLock integration (ci-checklist #41)", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not remount editor when onChange echoes edited markdown back to value", async () => {
    let capturedEditor: AetherEditor | null = null;

    function handleReady(editor: AetherEditor) {
      capturedEditor = editor;
    }

    function ControlledShell() {
      const [markdown, setMarkdown] = useState("Hello world\n");

      return React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: markdown,
          onChange: setMarkdown,
        },
        React.createElement(AetherEditorContent),
        React.createElement(EditorProbe, { onReady: handleReady }),
      );
    }

    render(React.createElement(ControlledShell));

    await waitFor(() => {
      assert.ok(capturedEditor);
    });

    const editorBeforeEdit = capturedEditor;

    await act(async () => {
      assert.ok(capturedEditor);
      const result = await capturedEditor.dispatch({
        id: "core:replaceText",
        payload: { blockIndex: 0, text: "Hello AetherMD" },
      });
      assert.equal(result.ok, true);
    });

    await waitFor(() => {
      const probe = document.querySelector('[data-testid="markdown-probe"]');
      assert.match(probe?.textContent ?? "", /Hello AetherMD/);
      assert.equal(capturedEditor, editorBeforeEdit);
      assert.ok(document.querySelector(".ProseMirror"));
    });
  });

  it("does not reset document when controlled value re-renders with the same markdown string", async () => {
    let capturedEditor: AetherEditor | null = null;

    function ControlledShell() {
      const [, bumpRender] = useState(0);

      React.useEffect(() => {
        (ControlledShell as { bump?: () => void }).bump = () => {
          bumpRender((count) => count + 1);
        };
      }, []);

      return React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: "Hello world\n",
        },
        React.createElement(AetherEditorContent),
        React.createElement(EditorProbe, {
          onReady: (editor) => {
            capturedEditor = editor;
          },
        }),
      );
    }

    render(React.createElement(ControlledShell));

    await waitFor(() => {
      assert.ok(capturedEditor);
    });

    await act(async () => {
      assert.ok(capturedEditor);
      const result = await capturedEditor.dispatch({
        id: "core:replaceText",
        payload: { blockIndex: 0, text: "Hello AetherMD" },
      });
      assert.equal(result.ok, true);
      const markdown = await capturedEditor.getMarkdown();
      assert.match(markdown, /Hello AetherMD/);
    });

    await waitFor(() => {
      const probe = document.querySelector('[data-testid="markdown-probe"]');
      assert.match(probe?.textContent ?? "", /Hello AetherMD/);
    });

    await act(async () => {
      (ControlledShell as { bump?: () => void }).bump?.();
    });

    await waitFor(() => {
      const probe = document.querySelector('[data-testid="markdown-probe"]');
      assert.match(probe?.textContent ?? "", /Hello AetherMD/);
    });
  });
});
