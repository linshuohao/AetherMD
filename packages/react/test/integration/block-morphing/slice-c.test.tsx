import "../../setup.js";

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";

import type { AetherEditor } from "@aether-md/core";

import { AetherEditorRoot, AetherMorphingDocument } from "../../../dist/index.js";
import { EditorCapture, SLICE_C_FIXTURE, queryBlock } from "../../helpers/morphing-fixtures.js";
import { createGfmEditorPlugins } from "../../helpers/gfm-plugins.js";

describe("Slice C multi-block Block Focus (block-morphing-slice-c)", () => {
  afterEach(() => {
    cleanup();
  });

  it("scenario C: only focused block B is in source state", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_C_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitFor(() => {
      assert.ok(
        document.querySelector('[data-testid="aether-morphing-document"][data-ready="true"]'),
      );
      assert.ok(document.querySelector('[data-testid="morphing-block-1"]'));
    });

    const blockB = queryBlock(1);
    const renderedB = blockB.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    await act(async () => {
      fireEvent.focus(renderedB);
    });

    await waitFor(() => {
      const sources = document.querySelectorAll('[data-testid="morphing-source"]');
      assert.equal(sources.length, 1);
      const sourceB = blockB.querySelector('[data-testid="morphing-source"]');
      assert.ok(sourceB);
      assert.match((sourceB as HTMLTextAreaElement).value, /\*\*two\*\*/);
    });

    const blockA = queryBlock(0);
    const blockC = queryBlock(2);
    assert.ok(blockA.querySelector('[data-testid="morphing-rendered"]'));
    assert.ok(blockC.querySelector('[data-testid="morphing-rendered"]'));
    assert.equal(blockA.querySelector('[data-testid="morphing-source"]'), null);
    assert.equal(blockC.querySelector('[data-testid="morphing-source"]'), null);
  });

  it("focus switch: block A returns to rendered when block B is focused", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_C_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitFor(() => {
      assert.ok(
        document.querySelector('[data-testid="aether-morphing-document"][data-ready="true"]'),
      );
      assert.ok(document.querySelector('[data-testid="morphing-block-0"]'));
    });

    const blockA = queryBlock(0);
    const renderedA = blockA.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    await act(async () => {
      fireEvent.focus(renderedA);
    });

    await waitFor(() => {
      assert.ok(blockA.querySelector('[data-testid="morphing-source"]'));
    });

    const blockB = queryBlock(1);
    const renderedB = blockB.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    await act(async () => {
      fireEvent.focus(renderedB);
    });

    await waitFor(() => {
      assert.equal(document.querySelectorAll('[data-testid="morphing-source"]').length, 1);
      assert.ok(blockB.querySelector('[data-testid="morphing-source"]'));
      assert.ok(blockA.querySelector('[data-testid="morphing-rendered"]'));
      assert.equal(blockA.querySelector('[data-testid="morphing-source"]'), null);
    });
  });

  it("editing block B does not reset block A content", async () => {
    let latestMarkdown = SLICE_C_FIXTURE;

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_C_FIXTURE,
          onChange: (next: string) => {
            latestMarkdown = next;
          },
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitFor(() => {
      assert.ok(
        document.querySelector('[data-testid="aether-morphing-document"][data-ready="true"]'),
      );
      assert.ok(document.querySelector('[data-testid="morphing-block-1"]'));
    });

    const blockB = queryBlock(1);
    const renderedB = blockB.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    await act(async () => {
      fireEvent.focus(renderedB);
    });

    await waitFor(() => {
      assert.ok(blockB.querySelector('[data-testid="morphing-source"]'));
    });

    const sourceB = blockB.querySelector('[data-testid="morphing-source"]') as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(sourceB, {
        target: { value: "Second **edited**" },
      });
    });

    await waitFor(() => {
      assert.match(latestMarkdown, /Second \*\*edited\*\*/);
      assert.match(latestMarkdown, /First \*\*one\*\*/);
    });

    const blockA = queryBlock(0);
    const renderedA = blockA.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;
    assert.ok(renderedA.querySelector("strong"));
    assert.equal(renderedA.textContent, "First one");
  });

  it("does not remount editor during multi-block focus and edits", async () => {
    let capturedEditor: AetherEditor | null = null;

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_C_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherMorphingDocument),
        React.createElement(EditorCapture, {
          onReady: (editor) => {
            capturedEditor = editor;
          },
        }),
      ),
    );

    await waitFor(() => {
      assert.ok(capturedEditor);
      assert.ok(document.querySelector('[data-testid="morphing-block-0"]'));
    });

    const editorBefore = capturedEditor;

    const blockA = queryBlock(0);
    await act(async () => {
      fireEvent.focus(blockA.querySelector('[data-testid="morphing-rendered"]') as HTMLElement);
    });

    const blockB = queryBlock(1);
    await act(async () => {
      fireEvent.focus(blockB.querySelector('[data-testid="morphing-rendered"]') as HTMLElement);
    });

    const sourceB = blockB.querySelector('[data-testid="morphing-source"]') as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(sourceB, {
        target: { value: "Second **typing**" },
      });
    });

    assert.strictEqual(capturedEditor, editorBefore);
  });
});
