import "./test-setup.js";

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import React from "react";

import type { AetherEditor } from "@aether-md/core";

import {
  AetherEditorContent,
  AetherEditorRoot,
  useAetherEditor,
} from "./index.js";
import { createGfmEditorPlugins } from "./test-helpers.js";

function MarkdownProbe() {
  const { markdown, ready } = useAetherEditor();
  if (!ready) {
    return null;
  }
  return React.createElement("div", { "data-testid": "markdown-probe" }, markdown);
}

describe("GFM React smoke", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders and edits paragraph fixture through dispatch path", async () => {
    let capturedEditor: AetherEditor | null = null;

    function EditorCapture({
      onReady,
    }: {
      onReady: (editor: AetherEditor) => void;
    }) {
      const { editor, ready } = useAetherEditor();

      React.useEffect(() => {
        if (ready && editor) {
          onReady(editor);
        }
      }, [ready, editor, onReady]);

      return null;
    }

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          initialValue: "Hello world\n",
        },
        React.createElement(AetherEditorContent),
        React.createElement(MarkdownProbe),
        React.createElement(EditorCapture, {
          onReady: (editor) => {
            capturedEditor = editor;
          },
        }),
      ),
    );

    await waitFor(() => {
      const probe = document.querySelector('[data-testid="markdown-probe"]');
      assert.ok(probe);
      assert.match(probe?.textContent ?? "", /Hello world/);
      assert.ok(capturedEditor);
    });

    await act(async () => {
      assert.ok(capturedEditor);
      const result = await capturedEditor.dispatch({
        id: "core:replaceText",
        payload: { blockIndex: 0, text: "Edited paragraph" },
      });
      assert.equal(result.ok, true);
    });

    await waitFor(() => {
      const probe = document.querySelector('[data-testid="markdown-probe"]');
      assert.match(probe?.textContent ?? "", /Edited paragraph/);
    });
  });

  it("renders strong inline fixture through React Shell", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          initialValue: "**bold**\n",
        },
        React.createElement(AetherEditorContent),
        React.createElement(MarkdownProbe),
      ),
    );

    await waitFor(() => {
      const probe = document.querySelector('[data-testid="markdown-probe"]');
      assert.ok(probe);
      assert.match(probe?.textContent ?? "", /bold/);
    });
  });

  it("renders list fixture through React Shell", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          initialValue: "- item one\n- item two\n",
        },
        React.createElement(AetherEditorContent),
        React.createElement(MarkdownProbe),
      ),
    );

    await waitFor(() => {
      const probe = document.querySelector('[data-testid="markdown-probe"]');
      assert.ok(probe);
      assert.match(probe?.textContent ?? "", /item one/);
      assert.match(probe?.textContent ?? "", /item two/);
    });
  });
});
