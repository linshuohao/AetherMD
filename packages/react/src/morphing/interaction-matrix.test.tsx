import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useState } from "react";

import type { AetherEditor } from "@aether-md/core";

import { AetherEditorRoot, AetherMorphingDocument } from "../index.js";
import { MorphingFocusProvider, useMorphingFocus } from "./morphing-focus-context.js";
import { createGfmEditorPlugins } from "../testing/gfm-plugins.js";
import {
  EditorCapture,
  INLINE_MARKS_MORPHING_FIXTURE,
  MULTI_BLOCK_FOCUS_FIXTURE,
  focusBlockSource,
  queryBlock,
  waitForBlockEditSynced,
  waitForMorphingDocumentReady,
} from "../testing/morphing-fixtures.js";

describe("Instant Morphing interaction matrix (product path)", () => {
  afterEach(() => {
    cleanup();
  });

  it("init: AetherMorphingDocument mounts data-ready with blocks visible", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: MULTI_BLOCK_FOCUS_FIXTURE,
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
          value: INLINE_MARKS_MORPHING_FIXTURE,
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
          value: INLINE_MARKS_MORPHING_FIXTURE,
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
          value: INLINE_MARKS_MORPHING_FIXTURE,
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
    let latestMarkdown = INLINE_MARKS_MORPHING_FIXTURE;
    const user = userEvent.setup();

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: INLINE_MARKS_MORPHING_FIXTURE,
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
    let latestMarkdown = INLINE_MARKS_MORPHING_FIXTURE;
    const user = userEvent.setup();

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: INLINE_MARKS_MORPHING_FIXTURE,
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
    let latestMarkdown = INLINE_MARKS_MORPHING_FIXTURE;
    const user = userEvent.setup();

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: INLINE_MARKS_MORPHING_FIXTURE,
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
    let latestMarkdown = INLINE_MARKS_MORPHING_FIXTURE;
    const user = userEvent.setup();

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: INLINE_MARKS_MORPHING_FIXTURE,
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
    let latestMarkdown = INLINE_MARKS_MORPHING_FIXTURE;
    const user = userEvent.setup();

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: INLINE_MARKS_MORPHING_FIXTURE,
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

  it("repeated focus on the same block does not re-run focus commit queue", async () => {
    let commitInvocations = 0;
    const blockId = "focus-spy-block";

    function FocusHarness() {
      const focusContext = useMorphingFocus();

      React.useEffect(() => {
        if (!focusContext) {
          return;
        }
        return focusContext.registerFocusCommit(blockId, async () => {
          commitInvocations += 1;
        });
      }, [focusContext]);

      return React.createElement(
        "button",
        {
          type: "button",
          "data-testid": "request-focus",
          onClick: () => focusContext?.requestFocus(blockId),
        },
        focusContext?.focusedBlockId ?? "none",
      );
    }

    const { getByTestId } = render(
      React.createElement(MorphingFocusProvider, null, React.createElement(FocusHarness)),
    );

    await act(async () => {
      getByTestId("request-focus").click();
    });

    await waitFor(() => {
      assert.equal(getByTestId("request-focus").textContent, blockId);
    });
    assert.equal(commitInvocations, 0);

    await act(async () => {
      getByTestId("request-focus").click();
      getByTestId("request-focus").click();
    });

    assert.equal(commitInvocations, 0);

    cleanup();

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: INLINE_MARKS_MORPHING_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitForMorphingDocumentReady();

    const source = await focusBlockSource(0);
    const sourceBefore = source;

    await act(async () => {
      fireEvent.focus(source);
      fireEvent.focus(source);
    });

    assert.equal(queryBlock(0).getAttribute("data-focused"), "true");
    assert.equal(queryBlock(0).querySelector('[data-testid="morphing-source"]'), sourceBefore);
  });

  it("focus switch: commits block A pending edit before focusing block B", async () => {
    let latestMarkdown = MULTI_BLOCK_FOCUS_FIXTURE;

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: MULTI_BLOCK_FOCUS_FIXTURE,
          onChange: (next: string) => {
            latestMarkdown = next;
          },
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitForMorphingDocumentReady();

    const sourceA = await focusBlockSource(0);

    await act(async () => {
      fireEvent.change(sourceA, {
        target: { value: "First **edited**" },
      });
    });

    const blockB = queryBlock(1);
    const renderedB = blockB.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    await act(async () => {
      fireEvent.focus(renderedB);
    });

    await waitFor(() => {
      assert.match(latestMarkdown, /First \*\*edited\*\*/);
      assert.ok(blockB.querySelector('[data-testid="morphing-source"]'));
      assert.ok(queryBlock(0).querySelector('[data-testid="morphing-rendered"]'));
      const renderedA = queryBlock(0).querySelector(
        '[data-testid="morphing-rendered"]',
      ) as HTMLElement;
      assert.equal(renderedA.querySelector("strong")?.textContent, "edited");
    });
  });

  it("stability: editor instance persists across consecutive typed edits", async () => {
    let capturedEditor: AetherEditor | null = null;
    const user = userEvent.setup();

    function ControlledMorphingDemo() {
      const [markdown, setMarkdown] = useState(INLINE_MARKS_MORPHING_FIXTURE);
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
