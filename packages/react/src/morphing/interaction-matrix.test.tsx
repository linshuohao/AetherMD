import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useState } from "react";

import type { AetherEditor } from "@aether-md/core";

import { AetherEditorRoot, AetherMorphingDocument } from "../index.js";
import { createGfmEditorPlugins } from "../testing/gfm-plugins.js";
import {
  EditorCapture,
  SLICE_B_FIXTURE,
  SLICE_C_FIXTURE,
  focusBlockSource,
  queryBlock,
  waitForBlockEditSynced,
  waitForMorphingDocumentReady,
} from "../testing/morphing-fixtures.js";

describe("L2 morphing interaction matrix (product path)", () => {
  afterEach(() => {
    cleanup();
  });

  it("init: AetherMorphingDocument mounts data-ready with blocks visible", async () => {
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

    await waitForMorphingDocumentReady();

    assert.equal(document.querySelectorAll('[data-testid^="morphing-block-"]').length, 3);
    assert.ok(queryBlock(0).querySelector('[data-testid="morphing-rendered"]'));
    assert.ok(queryBlock(1).querySelector('[data-testid="morphing-rendered"]'));
    assert.ok(queryBlock(2).querySelector('[data-testid="morphing-rendered"]'));
  });

  it("rendered display: strong, em, and link render without markdown sigils", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_B_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitForMorphingDocumentReady();

    const rendered = queryBlock(0).querySelector(
      '[data-testid="morphing-rendered"]',
    ) as HTMLElement;

    assert.ok(rendered.querySelector("strong"));
    assert.ok(rendered.querySelector("em"));
    assert.ok(rendered.querySelector('a[href="https://example.com"]'));
    assert.equal(rendered.querySelector("strong")?.textContent, "bold");
    assert.equal(rendered.querySelector("em")?.textContent, "emphasis");
    assert.doesNotMatch(rendered.textContent ?? "", /\*\*|\*emphasis\*|\[link\]/);
  });

  it("scenario A: focus exposes ** bold markdown sigils in source textarea", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_B_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitForMorphingDocumentReady();

    const source = await focusBlockSource(0);

    assert.match(source.value, /\*\*bold\*\*/);
    assert.match(source.value, /\[link\]\(https:\/\/example\.com\)/);
  });

  it("scenario A: focus exposes * emphasis markdown sigils in source textarea", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_B_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitForMorphingDocumentReady();

    const source = await focusBlockSource(0);

    assert.match(source.value, /\*emphasis\*/);
  });

  it("scenario B: blur restores rendered strong and syncs markdown", async () => {
    let latestMarkdown = SLICE_B_FIXTURE;
    const user = userEvent.setup();

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_B_FIXTURE,
          onChange: (next: string) => {
            latestMarkdown = next;
          },
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitForMorphingDocumentReady();

    const source = await focusBlockSource(0);

    await user.clear(source);
    await user.type(source, "Hello **galaxy**");

    await waitForBlockEditSynced(0);

    await waitFor(() => {
      assert.match(latestMarkdown, /\*\*galaxy\*\*/);
    });

    await act(async () => {
      fireEvent.blur(source);
    });

    await waitFor(() => {
      const rendered = queryBlock(0).querySelector(
        '[data-testid="morphing-rendered"]',
      ) as HTMLElement;
      assert.ok(rendered);
      assert.ok(rendered.querySelector("strong"));
      assert.equal(rendered.querySelector("strong")?.textContent, "galaxy");
      assert.doesNotMatch(rendered.textContent ?? "", /\*\*/);
    });

    assert.match(latestMarkdown, /Hello \*\*galaxy\*\*/);
  });

  it("keyboard typing: userEvent.type appends plain suffix text", async () => {
    let latestMarkdown = SLICE_B_FIXTURE;
    const user = userEvent.setup();

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_B_FIXTURE,
          onChange: (next: string) => {
            latestMarkdown = next;
          },
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitForMorphingDocumentReady();

    const source = await focusBlockSource(0);

    await user.click(source);
    await user.keyboard("{End} extra");

    await waitForBlockEditSynced(0);

    await waitFor(() => {
      assert.match(latestMarkdown, /extra/);
      assert.match(source.value, /extra/);
    });
  });

  it("keyboard typing: userEvent.keyboard replaces selected emphasis text", async () => {
    let latestMarkdown = SLICE_B_FIXTURE;
    const user = userEvent.setup();

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_B_FIXTURE,
          onChange: (next: string) => {
            latestMarkdown = next;
          },
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitForMorphingDocumentReady();

    const source = await focusBlockSource(0);

    const emphasisStart = source.value.indexOf("emphasis");
    assert.ok(emphasisStart >= 0);

    await user.click(source);
    source.setSelectionRange(emphasisStart, emphasisStart + "emphasis".length);
    await user.keyboard("universe");

    await waitForBlockEditSynced(0);

    await waitFor(() => {
      assert.match(latestMarkdown, /\*universe\*/);
      assert.match(source.value, /\*universe\*/);
    });
  });

  it("backspace: removes typed characters and syncs markdown", async () => {
    let latestMarkdown = SLICE_B_FIXTURE;
    const user = userEvent.setup();

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_B_FIXTURE,
          onChange: (next: string) => {
            latestMarkdown = next;
          },
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitForMorphingDocumentReady();

    const source = await focusBlockSource(0);

    await user.click(source);
    await user.keyboard("{End} tail");
    await waitForBlockEditSynced(0);

    assert.match(source.value, /tail$/);

    await user.keyboard("{Backspace}{Backspace}{Backspace}{Backspace}");

    await waitForBlockEditSynced(0);

    await waitFor(() => {
      assert.doesNotMatch(source.value, /tail$/);
      assert.doesNotMatch(latestMarkdown, /tail$/);
    });
  });

  it("scenario B: blur restores rendered emphasis after source edit", async () => {
    let latestMarkdown = SLICE_B_FIXTURE;
    const user = userEvent.setup();

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_B_FIXTURE,
          onChange: (next: string) => {
            latestMarkdown = next;
          },
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitForMorphingDocumentReady();

    const source = await focusBlockSource(0);

    await user.clear(source);
    await user.type(source, "Hello *italic* text.");

    await waitForBlockEditSynced(0);

    await waitFor(() => {
      assert.match(latestMarkdown, /\*italic\*/);
    });

    await act(async () => {
      fireEvent.blur(source);
    });

    await waitFor(() => {
      const rendered = queryBlock(0).querySelector(
        '[data-testid="morphing-rendered"]',
      ) as HTMLElement;
      assert.ok(rendered.querySelector("em"));
      assert.equal(rendered.querySelector("em")?.textContent, "italic");
      assert.doesNotMatch(rendered.textContent ?? "", /\*italic\*/);
    });
  });

  it("stability: editor instance persists across consecutive typed edits", async () => {
    let capturedEditor: AetherEditor | null = null;
    const user = userEvent.setup();

    function ControlledMorphingDemo() {
      const [markdown, setMarkdown] = useState(SLICE_B_FIXTURE);
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
          React.createElement(AetherMorphingDocument),
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

    const source = await focusBlockSource(0);

    await user.click(source);
    await user.keyboard("{End} one");
    await waitForBlockEditSynced(0);

    await user.keyboard(" two");
    await waitForBlockEditSynced(0);

    assert.strictEqual(capturedEditor, editorBefore);

    await act(async () => {
      getByTestId("force-rerender").click();
    });

    assert.strictEqual(capturedEditor, editorBefore);
  });
});
