import { type AetherEditor } from "@aether-md/core";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import React, { useState } from "react";

import { AetherEditorContent } from "../legacy.js";
import { AetherEditorRoot, useAetherEditor } from "../index.js";
import { createGfmEditorPlugins } from "../testing/gfm-plugins.js";

const GFM_FIXTURE = `# Demo Title

Hello **bold** text.

- item one

Visit [example](https://example.com).
`;

function MarkdownPreview() {
  const { markdown, ready } = useAetherEditor();
  return <pre data-testid="markdown-preview">{ready ? markdown : "Loading…"}</pre>;
}

describe("Demo slice PR0 acceptance (react-basic mirror)", () => {
  afterEach(() => {
    cleanup();
  });

  it("loads GFM subset in controlled Shell with editor and preview mounted", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: GFM_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherEditorContent),
        React.createElement(MarkdownPreview),
      ),
    );

    await waitFor(() => {
      const preview = document.querySelector('[data-testid="markdown-preview"]');
      assert.ok(preview);
      const text = preview?.textContent ?? "";
      assert.match(text, /Demo Title/);
      assert.match(text, /\*\*bold\*\*|bold/);
      assert.match(text, /item one/);
      assert.match(text, /example/);
      assert.ok(document.querySelector('[data-testid="aether-editor-content"]'));
    });
  });

  it("applies consecutive edits and keeps latest markdown in preview", async () => {
    let capturedEditor: AetherEditor | null = null;

    function CaptureEditor() {
      const { editor, ready } = useAetherEditor();
      React.useEffect(() => {
        if (ready && editor) {
          capturedEditor = editor;
        }
      }, [ready, editor]);
      return null;
    }

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: GFM_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherEditorContent),
        React.createElement(MarkdownPreview),
        React.createElement(CaptureEditor),
      ),
    );

    await waitFor(() => {
      assert.ok(capturedEditor);
    });

    await act(async () => {
      assert.ok(capturedEditor);
      const first = await capturedEditor.dispatch({
        id: "core:replaceText",
        payload: { blockIndex: 0, text: "Updated Title" },
      });
      assert.equal(first.ok, true);
    });

    await waitFor(() => {
      const preview = document.querySelector('[data-testid="markdown-preview"]');
      assert.match(preview?.textContent ?? "", /Updated Title/);
    });

    await act(async () => {
      assert.ok(capturedEditor);
      const second = await capturedEditor.dispatch({
        id: "core:replaceText",
        payload: { blockIndex: 1, text: "Edited paragraph line" },
      });
      assert.equal(second.ok, true);
    });

    await waitFor(() => {
      const preview = document.querySelector('[data-testid="markdown-preview"]');
      const text = preview?.textContent ?? "";
      assert.match(text, /Updated Title/);
      assert.match(text, /Edited paragraph line/);
      assert.match(text, /item one/);
    });
  });

  it("preserves edited document when parent rerenders without value change", async () => {
    let capturedEditor: AetherEditor | null = null;

    function ControlledDemo() {
      const [markdown, setMarkdown] = useState(GFM_FIXTURE);
      const [, bumpRender] = useState(0);

      React.useEffect(() => {
        (ControlledDemo as { bump?: () => void }).bump = () => {
          bumpRender((count) => count + 1);
        };
      }, []);

      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          "button",
          {
            type: "button",
            "data-testid": "force-rerender",
            onClick: () => {
              (ControlledDemo as { bump?: () => void }).bump?.();
            },
          },
          "Force rerender",
        ),
        React.createElement(
          AetherEditorRoot,
          {
            plugins: createGfmEditorPlugins(),
            value: markdown,
            onChange: setMarkdown,
          },
          React.createElement(AetherEditorContent),
          React.createElement(MarkdownPreview),
          React.createElement(EditorCapture, {
            onReady: (editor) => {
              capturedEditor = editor;
            },
          }),
        ),
      );
    }

    function EditorCapture({ onReady }: { onReady: (editor: AetherEditor) => void }) {
      const { editor, ready } = useAetherEditor();
      React.useEffect(() => {
        if (ready && editor) {
          onReady(editor);
        }
      }, [ready, editor, onReady]);
      return null;
    }

    const { getByTestId } = render(React.createElement(ControlledDemo));

    await waitFor(() => {
      assert.ok(capturedEditor);
    });

    const editorBefore = capturedEditor;

    await act(async () => {
      assert.ok(capturedEditor);
      const result = await capturedEditor.dispatch({
        id: "core:replaceText",
        payload: { blockIndex: 1, text: "GateLock preserved edit" },
      });
      assert.equal(result.ok, true);
    });

    await waitFor(() => {
      const preview = document.querySelector('[data-testid="markdown-preview"]');
      assert.match(preview?.textContent ?? "", /GateLock preserved edit/);
    });

    await act(async () => {
      getByTestId("force-rerender").click();
    });

    assert.strictEqual(capturedEditor, editorBefore);

    await waitFor(() => {
      const preview = document.querySelector('[data-testid="markdown-preview"]');
      assert.match(preview?.textContent ?? "", /GateLock preserved edit/);
    });
  });
});
