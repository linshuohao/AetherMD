import "../../setup.js";

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import React from "react";

import {
  dispatchProseMirrorInsertText,
  findProseMirrorTextEnd,
  resolveProseMirrorView,
} from "@aether-md/plugin-prosemirror";

import { AetherEditorContent, AetherEditorRoot, useAetherEditor } from "../../../dist/index.js";
import { createGfmEditorPlugins } from "../../helpers/gfm-plugins.js";

const GFM_FIXTURE = `# Demo Title

Hello **bold** text.

- item one

Visit [example](https://example.com).
`;

function MarkdownPreview() {
  const { markdown, ready } = useAetherEditor();
  return <pre data-testid="markdown-preview">{ready ? markdown : "Loading…"}</pre>;
}

function renderTypingShell() {
  return render(
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
}

function getEditorView() {
  const container = document.querySelector('[data-testid="aether-editor-content"]');
  assert.ok(container);
  const view = resolveProseMirrorView(container as HTMLElement);
  assert.ok(view, "ProseMirror EditorView not found under aether-editor-content");
  return view;
}

async function insertTextAt(
  view: ReturnType<typeof getEditorView>,
  position: number,
  text: string,
) {
  await act(async () => {
    dispatchProseMirrorInsertText(view, position, text);
  });
}

async function waitForPreviewMatching(pattern: RegExp) {
  await waitFor(() => {
    const preview = document.querySelector('[data-testid="markdown-preview"]');
    assert.match(preview?.textContent ?? "", pattern);
  });
}

describe("Demo slice typing sync (ProseMirror insertText)", () => {
  afterEach(() => {
    cleanup();
  });

  it("updates preview after consecutive insertText in a plain paragraph", async () => {
    renderTypingShell();

    await waitFor(() => {
      assert.ok(document.querySelector(".ProseMirror"));
    });

    const view = getEditorView();
    const position = findProseMirrorTextEnd(view, "text.");

    await insertTextAt(view, position, " More");
    await waitForPreviewMatching(/More/);

    await insertTextAt(view, position + " More".length, " typing");
    await waitForPreviewMatching(/More typing/);
  });

  it("updates preview after insertText in a heading block", async () => {
    renderTypingShell();

    await waitFor(() => {
      assert.ok(document.querySelector(".ProseMirror"));
    });

    const view = getEditorView();
    const position = findProseMirrorTextEnd(view, "Demo Title");

    await insertTextAt(view, position, "!");
    await waitForPreviewMatching(/Demo Title!/);
  });

  it("updates preview after insertText inside a list item paragraph", async () => {
    renderTypingShell();

    await waitFor(() => {
      assert.ok(document.querySelector(".ProseMirror"));
    });

    const view = getEditorView();
    const position = findProseMirrorTextEnd(view, "item one");

    await insertTextAt(view, position, " updated");
    await waitForPreviewMatching(/item one updated/);
  });

  it("preserves strong and link marks when typing adjacent text", async () => {
    renderTypingShell();

    await waitFor(() => {
      assert.ok(document.querySelector(".ProseMirror"));
    });

    const view = getEditorView();
    const paragraphEnd = findProseMirrorTextEnd(view, "text.");
    await insertTextAt(view, paragraphEnd, "!");
    await waitFor(() => {
      const preview = document.querySelector('[data-testid="markdown-preview"]');
      const text = preview?.textContent ?? "";
      assert.match(text, /\*\*bold\*\*/);
      assert.match(text, /text\.!/);
    });

    const linkEnd = findProseMirrorTextEnd(view, "example");
    await insertTextAt(view, linkEnd, "!");
    await waitFor(() => {
      const preview = document.querySelector('[data-testid="markdown-preview"]');
      const text = preview?.textContent ?? "";
      assert.match(text, /\[example\]\(https:\/\/example\.com\)/);
      assert.match(text, /!/);
    });
  });
});
