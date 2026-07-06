import "./test-setup.js";

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import React, { useState } from "react";

import type { AetherEditor } from "@aether-md/core";

import { AetherEditorRoot, AetherMorphingContent } from "./index.js";
import { EditorCapture, SLICE_A_FIXTURE } from "./block-morphing-test-helpers.js";
import { createGfmEditorPlugins } from "./test-helpers.js";

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

    const rendered = document.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

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

    const rendered = document.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    await act(async () => {
      fireEvent.focus(rendered);
    });

    await waitFor(() => {
      assert.ok(document.querySelector('[data-testid="morphing-source"]'));
    });

    const source = document.querySelector('[data-testid="morphing-source"]') as HTMLTextAreaElement;

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
      const renderedAfter = document.querySelector('[data-testid="morphing-rendered"]');
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

    const rendered = document.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    await act(async () => {
      fireEvent.focus(rendered);
    });

    await waitFor(() => {
      assert.ok(document.querySelector('[data-testid="morphing-source"]'));
    });

    const source = document.querySelector('[data-testid="morphing-source"]') as HTMLTextAreaElement;

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
