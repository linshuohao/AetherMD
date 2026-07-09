import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";

import type { AetherEditor } from "@aether-md/core";

import { AetherEditorRoot, AetherMorphingContent, AetherMorphingDocument } from "../index.js";
import { createGfmEditorPlugins } from "../testing/gfm-plugins.js";
import {
  EditorCapture,
  PARAGRAPH_MORPHING_FIXTURE,
  INLINE_MARKS_MORPHING_FIXTURE,
  MULTI_BLOCK_FOCUS_FIXTURE,
  appendToSource,
  backspaceSource,
  dispatchSourceInput,
  focusBlockSource,
  queryBlock,
  replaceSourceSelection,
  waitForBlockEditSynced,
  waitForMorphingDocumentReady,
} from "../testing/morphing-fixtures.js";

describe("Instant Morphing interaction matrix (product path)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("init: AetherMorphingDocument mounts data-ready with blocks visible", async () => {
    const wrapper = mountMorphingDocument({ initialValue: MULTI_BLOCK_FOCUS_FIXTURE });
    await flushPromises();

    await waitForMorphingDocumentReady();

    assert.equal(document.querySelectorAll('[data-testid^="morphing-block-"]').length, 3);
    assert.ok(queryBlock(0).querySelector('[data-testid="morphing-rendered"]'));
    assert.ok(queryBlock(1).querySelector('[data-testid="morphing-rendered"]'));
    assert.ok(queryBlock(2).querySelector('[data-testid="morphing-rendered"]'));

    wrapper.unmount();
    await flushPromises();
  });

  it("rendered display: strong, em, and link render without markdown sigils", async () => {
    const wrapper = mountMorphingDocument({ initialValue: INLINE_MARKS_MORPHING_FIXTURE });
    await flushPromises();

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

    wrapper.unmount();
    await flushPromises();
  });

  it("scenario A: focus exposes ** bold markdown sigils in source textarea", async () => {
    const wrapper = mountMorphingDocument({ initialValue: INLINE_MARKS_MORPHING_FIXTURE });
    await flushPromises();

    await waitForMorphingDocumentReady();

    const source = await focusBlockSource(0);

    assert.match(source.value, /\*\*bold\*\*/);
    assert.match(source.value, /\[link\]\(https:\/\/example\.com\)/);

    wrapper.unmount();
    await flushPromises();
  });

  it("scenario A: focus exposes * emphasis markdown sigils in source textarea", async () => {
    const wrapper = mountMorphingDocument({ initialValue: INLINE_MARKS_MORPHING_FIXTURE });
    await flushPromises();

    await waitForMorphingDocumentReady();

    const source = await focusBlockSource(0);

    assert.match(source.value, /\*emphasis\*/);

    wrapper.unmount();
    await flushPromises();
  });

  it("scenario B: blur restores rendered strong and syncs markdown", async () => {
    let latestMarkdown = INLINE_MARKS_MORPHING_FIXTURE;

    const wrapper = mountMorphingDocument({
      initialValue: INLINE_MARKS_MORPHING_FIXTURE,
      onChange: (next: string) => {
        latestMarkdown = next;
      },
    });
    await flushPromises();

    await waitForMorphingDocumentReady();

    const source = await focusBlockSource(0);

    dispatchSourceInput(source, "Hello **galaxy**");

    await waitForBlockEditSynced(0);

    await waitFor(() => {
      assert.match(latestMarkdown, /\*\*galaxy\*\*/);
    });

    source.blur();
    await flushPromises();

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

    wrapper.unmount();
    await flushPromises();
  });

  it("keyboard typing: appends plain suffix text", async () => {
    let latestMarkdown = INLINE_MARKS_MORPHING_FIXTURE;

    const wrapper = mountMorphingDocument({
      initialValue: INLINE_MARKS_MORPHING_FIXTURE,
      onChange: (next: string) => {
        latestMarkdown = next;
      },
    });
    await flushPromises();

    await waitForMorphingDocumentReady();

    const source = await focusBlockSource(0);

    source.focus();
    appendToSource(source, " extra");

    await waitForBlockEditSynced(0);

    await waitFor(() => {
      assert.match(latestMarkdown, /extra/);
      assert.match(source.value, /extra/);
    });

    wrapper.unmount();
    await flushPromises();
  });

  it("keyboard typing: replaces selected emphasis text", async () => {
    let latestMarkdown = INLINE_MARKS_MORPHING_FIXTURE;

    const wrapper = mountMorphingDocument({
      initialValue: INLINE_MARKS_MORPHING_FIXTURE,
      onChange: (next: string) => {
        latestMarkdown = next;
      },
    });
    await flushPromises();

    await waitForMorphingDocumentReady();

    const source = await focusBlockSource(0);

    const emphasisStart = source.value.indexOf("emphasis");
    assert.ok(emphasisStart >= 0);

    source.focus();
    source.setSelectionRange(emphasisStart, emphasisStart + "emphasis".length);
    replaceSourceSelection(source, "universe");

    await waitForBlockEditSynced(0);

    await waitFor(() => {
      assert.match(latestMarkdown, /\*universe\*/);
      assert.match(source.value, /\*universe\*/);
    });

    wrapper.unmount();
    await flushPromises();
  });

  it("backspace: removes typed characters and syncs markdown", async () => {
    let latestMarkdown = INLINE_MARKS_MORPHING_FIXTURE;

    const wrapper = mountMorphingDocument({
      initialValue: INLINE_MARKS_MORPHING_FIXTURE,
      onChange: (next: string) => {
        latestMarkdown = next;
      },
    });
    await flushPromises();

    await waitForMorphingDocumentReady();

    const source = await focusBlockSource(0);

    source.focus();
    appendToSource(source, " tail");
    await waitForBlockEditSynced(0);

    assert.match(source.value, /tail$/);

    backspaceSource(source, 4);

    await waitForBlockEditSynced(0);

    await waitFor(() => {
      assert.doesNotMatch(source.value, /tail$/);
      assert.doesNotMatch(latestMarkdown, /tail$/);
    });

    wrapper.unmount();
    await flushPromises();
  });

  it("scenario B: blur restores rendered emphasis after source edit", async () => {
    let latestMarkdown = INLINE_MARKS_MORPHING_FIXTURE;

    const wrapper = mountMorphingDocument({
      initialValue: INLINE_MARKS_MORPHING_FIXTURE,
      onChange: (next: string) => {
        latestMarkdown = next;
      },
    });
    await flushPromises();

    await waitForMorphingDocumentReady();

    const source = await focusBlockSource(0);

    dispatchSourceInput(source, "Hello *italic* text.");

    await waitForBlockEditSynced(0);

    await waitFor(() => {
      assert.match(latestMarkdown, /\*italic\*/);
    });

    source.blur();
    await flushPromises();

    await waitFor(() => {
      const rendered = queryBlock(0).querySelector(
        '[data-testid="morphing-rendered"]',
      ) as HTMLElement;
      assert.ok(rendered.querySelector("em"));
      assert.equal(rendered.querySelector("em")?.textContent, "italic");
      assert.doesNotMatch(rendered.textContent ?? "", /\*italic\*/);
    });

    wrapper.unmount();
    await flushPromises();
  });

  it("focus switch: commits block A pending edit before focusing block B", async () => {
    let latestMarkdown = MULTI_BLOCK_FOCUS_FIXTURE;

    const wrapper = mountMorphingDocument({
      initialValue: MULTI_BLOCK_FOCUS_FIXTURE,
      onChange: (next: string) => {
        latestMarkdown = next;
      },
    });
    await flushPromises();

    await waitForMorphingDocumentReady();

    const sourceA = await focusBlockSource(0);

    dispatchSourceInput(sourceA, "First **edited**");

    const blockB = queryBlock(1);
    const renderedB = blockB.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    renderedB.focus();
    await flushPromises();

    await waitFor(() => {
      assert.match(latestMarkdown, /First \*\*edited\*\*/);
      assert.ok(blockB.querySelector('[data-testid="morphing-source"]'));
      assert.ok(queryBlock(0).querySelector('[data-testid="morphing-rendered"]'));
      const renderedA = queryBlock(0).querySelector(
        '[data-testid="morphing-rendered"]',
      ) as HTMLElement;
      assert.equal(renderedA.querySelector("strong")?.textContent, "edited");
    });

    wrapper.unmount();
    await flushPromises();
  });

  it("scenario C: only focused block B is in source state", async () => {
    const wrapper = mountMorphingDocument({ initialValue: MULTI_BLOCK_FOCUS_FIXTURE });
    await flushPromises();

    await waitForMorphingDocumentReady();

    const blockB = queryBlock(1);
    const renderedB = blockB.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    renderedB.focus();
    await flushPromises();

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

    wrapper.unmount();
    await flushPromises();
  });

  it("slice A scenario A: focused block shows Markdown source with ** sigils", async () => {
    const wrapper = mountMorphingContent({ initialValue: PARAGRAPH_MORPHING_FIXTURE });
    await flushPromises();

    await waitFor(() => {
      assert.ok(document.querySelector('[data-testid="morphing-rendered"]'));
    });

    const rendered = document.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    rendered.focus();
    await flushPromises();

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

    wrapper.unmount();
    await flushPromises();
  });

  it("slice A scenario B: blurred block shows rendered typography and consistent serialization", async () => {
    let latestMarkdown = PARAGRAPH_MORPHING_FIXTURE;

    const wrapper = mountMorphingContent({
      initialValue: PARAGRAPH_MORPHING_FIXTURE,
      onChange: (next: string) => {
        latestMarkdown = next;
      },
    });
    await flushPromises();

    await waitFor(() => {
      assert.ok(document.querySelector('[data-testid="morphing-rendered"]'));
    });

    const rendered = document.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    rendered.focus();
    await flushPromises();

    await waitFor(() => {
      assert.ok(document.querySelector('[data-testid="morphing-source"]'));
    });

    const source = document.querySelector('[data-testid="morphing-source"]') as HTMLTextAreaElement;

    dispatchSourceInput(source, "Hello **universe**");

    await waitFor(() => {
      assert.match(latestMarkdown, /\*\*universe\*\*/);
    });

    source.blur();
    await flushPromises();

    await waitFor(() => {
      const renderedAfter = document.querySelector('[data-testid="morphing-rendered"]');
      assert.ok(renderedAfter);
      assert.ok(renderedAfter.querySelector("strong"));
      assert.equal(renderedAfter.textContent, "Hello universe");
      assert.doesNotMatch(renderedAfter.textContent ?? "", /\*\*/);
    });

    assert.match(latestMarkdown, /Hello \*\*universe\*\*/);

    wrapper.unmount();
    await flushPromises();
  });

  it("stability: editor instance persists across consecutive typed edits", async () => {
    let capturedEditor: AetherEditor | null = null;
    const bumpRender = ref(0);

    const ControlledMorphingDemo = defineComponent({
      setup() {
        const markdown = ref(INLINE_MARKS_MORPHING_FIXTURE);
        const plugins = createGfmEditorPlugins();
        return () => {
          void bumpRender.value;
          return h(
            AetherEditorRoot,
            {
              plugins,
              value: markdown.value,
              onChange: (next: string) => {
                markdown.value = next;
              },
            },
            {
              default: () => [
                h(AetherMorphingDocument),
                h(EditorCapture, {
                  onReady: (editor: AetherEditor) => {
                    capturedEditor = editor;
                  },
                }),
              ],
            },
          );
        };
      },
    });

    const wrapper = mount(ControlledMorphingDemo, { attachTo: document.body });
    await flushPromises();

    await waitFor(() => {
      assert.ok(capturedEditor);
    });

    const editorBefore = capturedEditor;

    const source = await focusBlockSource(0);

    source.focus();
    appendToSource(source, " one");
    await waitForBlockEditSynced(0);

    appendToSource(source, " two");
    await waitForBlockEditSynced(0);

    assert.strictEqual(capturedEditor, editorBefore);

    bumpRender.value += 1;
    await flushPromises();

    assert.strictEqual(capturedEditor, editorBefore);

    wrapper.unmount();
    await flushPromises();
  });
});

function mountMorphingDocument(options: {
  initialValue: string;
  onChange?: (markdown: string) => void;
}) {
  const App = defineComponent({
    setup() {
      const plugins = createGfmEditorPlugins();
      const markdown = ref(options.initialValue);
      return () =>
        h(
          AetherEditorRoot,
          {
            plugins,
            value: markdown.value,
            onChange: (next: string) => {
              markdown.value = next;
              options.onChange?.(next);
            },
          },
          {
            default: () => [h(AetherMorphingDocument)],
          },
        );
    },
  });

  return mount(App, { attachTo: document.body });
}

function mountMorphingContent(options: {
  initialValue: string;
  onChange?: (markdown: string) => void;
}) {
  const App = defineComponent({
    setup() {
      const plugins = createGfmEditorPlugins();
      const markdown = ref(options.initialValue);
      return () =>
        h(
          AetherEditorRoot,
          {
            plugins,
            value: markdown.value,
            onChange: (next: string) => {
              markdown.value = next;
              options.onChange?.(next);
            },
          },
          {
            default: () => [h(AetherMorphingContent)],
          },
        );
    },
  });

  return mount(App, { attachTo: document.body });
}

async function waitFor(assertion: () => void, timeout = 5000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      assertion();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  assertion();
}
