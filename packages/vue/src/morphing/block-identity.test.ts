import { type AetherEditor } from "@aether-md/core";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";

import { AetherEditorRoot, AetherMorphingDocument } from "../index.js";
import { createGfmEditorPlugins } from "../testing/gfm-plugins.js";
import {
  EditorCapture,
  MULTI_BLOCK_FOCUS_FIXTURE,
  waitForMorphingDocumentReady,
} from "../testing/morphing-fixtures.js";

describe("Block stable identity (block-identity)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("exposes stable data-block-id on morphing surfaces", async () => {
    const wrapper = mountMorphingDocument({ initialValue: MULTI_BLOCK_FOCUS_FIXTURE });
    await flushPromises();

    await waitForMorphingDocumentReady();

    const blocks = document.querySelectorAll("[data-block-id]");
    assert.equal(blocks.length, 3);

    const ids = [...blocks].map((node) => node.getAttribute("data-block-id"));
    assert.equal(new Set(ids).size, 3);
    for (const id of ids) {
      assert.match(id ?? "", /^blk_/);
    }

    wrapper.unmount();
    await flushPromises();
  });

  it("routes Block Focus by block id, not array index", async () => {
    const wrapper = mountMorphingDocument({ initialValue: MULTI_BLOCK_FOCUS_FIXTURE });
    await flushPromises();

    await waitForMorphingDocumentReady();

    assert.ok(document.querySelectorAll('[data-testid="morphing-rendered"]').length >= 2);

    const middleBlock = document.querySelectorAll("[data-block-id]")[1] as HTMLElement;
    const middleBlockId = middleBlock.getAttribute("data-block-id");
    assert.ok(middleBlockId);

    const rendered = middleBlock.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    rendered.focus();
    await flushPromises();

    await waitFor(() => {
      const focused = document.querySelector(
        `[data-block-id="${middleBlockId}"][data-focused="true"]`,
      );
      assert.ok(focused);
      assert.ok(focused?.querySelector('[data-testid="morphing-source"]'));
    });

    wrapper.unmount();
    await flushPromises();
  });

  it("preserves Block Focus after in-session moveBlock reorder", async () => {
    let capturedEditor: AetherEditor | null = null;

    const wrapper = mountMorphingDocumentWithCapture({
      initialValue: MULTI_BLOCK_FOCUS_FIXTURE,
      onEditorReady: (editor) => {
        capturedEditor = editor;
      },
    });
    await flushPromises();

    await waitForMorphingDocumentReady();

    await waitFor(() => {
      assert.ok(capturedEditor);
    });
    assert.equal(document.querySelectorAll("[data-block-id]").length, 3);

    const middleBlock = document.querySelectorAll("[data-block-id]")[1] as HTMLElement;
    const middleBlockId = middleBlock.getAttribute("data-block-id");
    assert.ok(middleBlockId);

    const rendered = middleBlock.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    rendered.focus();
    await flushPromises();

    await waitFor(() => {
      assert.ok(document.querySelector(`[data-block-id="${middleBlockId}"][data-focused="true"]`));
    });

    const result = await capturedEditor!.dispatch({
      id: "core:moveBlock",
      payload: { blockId: middleBlockId, toIndex: 2 },
    });
    assert.equal(result.ok, true);

    await waitFor(() => {
      const blocks = [...document.querySelectorAll("[data-block-id]")];
      assert.equal(blocks[2]?.getAttribute("data-block-id"), middleBlockId);
      assert.ok(document.querySelector(`[data-block-id="${middleBlockId}"][data-focused="true"]`));
    });

    wrapper.unmount();
    await flushPromises();
  });
});

function mountMorphingDocument(options: { initialValue: string }) {
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

function mountMorphingDocumentWithCapture(options: {
  initialValue: string;
  onEditorReady: (editor: AetherEditor) => void;
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
            },
          },
          {
            default: () => [
              h(AetherMorphingDocument),
              h(EditorCapture, {
                onReady: options.onEditorReady,
              }),
            ],
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
