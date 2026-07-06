import "./test-setup.js";

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import React, { useState } from "react";

import type { AetherEditor } from "@aether-md/core";

import {
  AetherEditorRoot,
  AetherMorphingContent,
  AetherMorphingDocument,
  useAetherEditor,
} from "./index.js";
import { createGfmEditorPlugins } from "./test-helpers.js";

const SLICE_A_FIXTURE = "Hello **world**\n";

const SLICE_C_FIXTURE =
  "First **one**\n\nSecond **two**\n\nThird plain\n";

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

function queryBlock(index: number): HTMLElement {
  const block = document.querySelector(`[data-testid="morphing-block-${index}"]`);
  assert.ok(block, `expected morphing-block-${index}`);
  return block as HTMLElement;
}

describe("Slice A block morphing (block-morphing-slice-1)", () => {
  afterEach(() => {
    cleanup();
  });

  it("scenario A: focused block shows Markdown source with ** sigils", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_A_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherMorphingContent),
      ),
    );

    await waitFor(() => {
      assert.ok(document.querySelector('[data-testid="morphing-rendered"]'));
    });

    const rendered = document.querySelector(
      '[data-testid="morphing-rendered"]',
    ) as HTMLElement;

    await act(async () => {
      fireEvent.focus(rendered);
    });

    await waitFor(() => {
      const source = document.querySelector(
        '[data-testid="morphing-source"]',
      ) as HTMLTextAreaElement | null;
      assert.ok(source);
      assert.match(source.value, /\*\*world\*\*/);
    });

    assert.equal(
      document.querySelector('[data-testid="markdown-preview"]'),
      null,
      "must not require a separate preview panel",
    );
  });

  it("scenario B: blurred block shows rendered typography and consistent serialization", async () => {
    let latestMarkdown = SLICE_A_FIXTURE;

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_A_FIXTURE,
          onChange: (next: string) => {
            latestMarkdown = next;
          },
        },
        React.createElement(AetherMorphingContent),
      ),
    );

    await waitFor(() => {
      assert.ok(document.querySelector('[data-testid="morphing-rendered"]'));
    });

    const rendered = document.querySelector(
      '[data-testid="morphing-rendered"]',
    ) as HTMLElement;

    await act(async () => {
      fireEvent.focus(rendered);
    });

    await waitFor(() => {
      assert.ok(document.querySelector('[data-testid="morphing-source"]'));
    });

    const source = document.querySelector(
      '[data-testid="morphing-source"]',
    ) as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(source, {
        target: { value: "Hello **universe**" },
      });
    });

    await waitFor(() => {
      assert.match(latestMarkdown, /\*\*universe\*\*/);
    });

    await act(async () => {
      fireEvent.blur(source);
    });

    await waitFor(() => {
      const renderedAfter = document.querySelector(
        '[data-testid="morphing-rendered"]',
      );
      assert.ok(renderedAfter);
      assert.ok(renderedAfter.querySelector("strong"));
      assert.equal(renderedAfter.textContent, "Hello universe");
      assert.doesNotMatch(renderedAfter.textContent ?? "", /\*\*/);
    });

    assert.match(latestMarkdown, /Hello \*\*universe\*\*/);
  });

  it("does not remount editor on consecutive edits or parent rerender", async () => {
    let capturedEditor: AetherEditor | null = null;

    function ControlledMorphingDemo() {
      const [markdown, setMarkdown] = useState(SLICE_A_FIXTURE);
      const [, bumpRender] = useState(0);

      React.useEffect(() => {
        (ControlledMorphingDemo as { bump?: () => void }).bump = () => {
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
              (ControlledMorphingDemo as { bump?: () => void }).bump?.();
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
          React.createElement(AetherMorphingContent),
          React.createElement(EditorCapture, {
            onReady: (editor) => {
              capturedEditor = editor;
            },
          }),
        ),
      );
    }

    const { getByTestId } = render(React.createElement(ControlledMorphingDemo));

    await waitFor(() => {
      assert.ok(capturedEditor);
    });

    const editorBefore = capturedEditor;

    const rendered = document.querySelector(
      '[data-testid="morphing-rendered"]',
    ) as HTMLElement;

    await act(async () => {
      fireEvent.focus(rendered);
    });

    await waitFor(() => {
      assert.ok(document.querySelector('[data-testid="morphing-source"]'));
    });

    const source = document.querySelector(
      '[data-testid="morphing-source"]',
    ) as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(source, {
        target: { value: "Hello **edited**" },
      });
    });

    await act(async () => {
      fireEvent.change(source, {
        target: { value: "Hello **edited again**" },
      });
    });

    assert.strictEqual(capturedEditor, editorBefore);

    await act(async () => {
      getByTestId("force-rerender").click();
    });

    assert.strictEqual(capturedEditor, editorBefore);
  });
});

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
        document.querySelector(
          '[data-testid="aether-morphing-document"][data-ready="true"]',
        ),
      );
      assert.ok(document.querySelector('[data-testid="morphing-block-1"]'));
    });

    const blockB = queryBlock(1);
    const renderedB = blockB.querySelector(
      '[data-testid="morphing-rendered"]',
    ) as HTMLElement;

    await act(async () => {
      fireEvent.focus(renderedB);
    });

    await waitFor(() => {
      const sources = document.querySelectorAll('[data-testid="morphing-source"]');
      assert.equal(sources.length, 1);
      const sourceB = blockB.querySelector('[data-testid="morphing-source"]');
      assert.ok(sourceB);
      assert.match(
        (sourceB as HTMLTextAreaElement).value,
        /\*\*two\*\*/,
      );
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
        document.querySelector(
          '[data-testid="aether-morphing-document"][data-ready="true"]',
        ),
      );
      assert.ok(document.querySelector('[data-testid="morphing-block-0"]'));
    });

    const blockA = queryBlock(0);
    const renderedA = blockA.querySelector(
      '[data-testid="morphing-rendered"]',
    ) as HTMLElement;

    await act(async () => {
      fireEvent.focus(renderedA);
    });

    await waitFor(() => {
      assert.ok(blockA.querySelector('[data-testid="morphing-source"]'));
    });

    const blockB = queryBlock(1);
    const renderedB = blockB.querySelector(
      '[data-testid="morphing-rendered"]',
    ) as HTMLElement;

    await act(async () => {
      fireEvent.focus(renderedB);
    });

    await waitFor(() => {
      assert.equal(
        document.querySelectorAll('[data-testid="morphing-source"]').length,
        1,
      );
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
        document.querySelector(
          '[data-testid="aether-morphing-document"][data-ready="true"]',
        ),
      );
      assert.ok(document.querySelector('[data-testid="morphing-block-1"]'));
    });

    const blockB = queryBlock(1);
    const renderedB = blockB.querySelector(
      '[data-testid="morphing-rendered"]',
    ) as HTMLElement;

    await act(async () => {
      fireEvent.focus(renderedB);
    });

    await waitFor(() => {
      assert.ok(blockB.querySelector('[data-testid="morphing-source"]'));
    });

    const sourceB = blockB.querySelector(
      '[data-testid="morphing-source"]',
    ) as HTMLTextAreaElement;

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
    const renderedA = blockA.querySelector(
      '[data-testid="morphing-rendered"]',
    ) as HTMLElement;
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
      fireEvent.focus(
        blockA.querySelector('[data-testid="morphing-rendered"]') as HTMLElement,
      );
    });

    const blockB = queryBlock(1);
    await act(async () => {
      fireEvent.focus(
        blockB.querySelector('[data-testid="morphing-rendered"]') as HTMLElement,
      );
    });

    const sourceB = blockB.querySelector(
      '[data-testid="morphing-source"]',
    ) as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(sourceB, {
        target: { value: "Second **typing**" },
      });
    });

    assert.strictEqual(capturedEditor, editorBefore);
  });
});
