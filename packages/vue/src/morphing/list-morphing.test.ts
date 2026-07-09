import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";

import { AetherEditorRoot, AetherMorphingDocument } from "../index.js";
import { createGfmEditorPlugins } from "../testing/gfm-plugins.js";
import {
  LIST_MORPHING_FIXTURE,
  dispatchSourceInput,
  queryBlock,
  waitForMorphingDocumentReady,
} from "../testing/morphing-fixtures.js";

describe("list block morphing", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("scenario D1: focused list block shows Markdown list source", async () => {
    const wrapper = mountMorphingDocument({ initialValue: LIST_MORPHING_FIXTURE });
    await flushPromises();

    await waitForMorphingDocumentReady();

    const listBlock = queryBlock(1);
    assert.equal(listBlock.getAttribute("data-block-type"), "list");

    const renderedList = listBlock.querySelector(
      '[data-testid="morphing-rendered"]',
    ) as HTMLElement;

    renderedList.focus();
    await flushPromises();

    await waitFor(() => {
      const source = listBlock.querySelector(
        '[data-testid="morphing-source"]',
      ) as HTMLTextAreaElement | null;
      assert.ok(source);
      assert.match(source.value, /^- alpha/);
      assert.match(source.value, /- beta/);
    });

    const introBlock = queryBlock(0);
    assert.ok(introBlock.querySelector('[data-testid="morphing-rendered"]'));
    assert.equal(introBlock.querySelector('[data-testid="morphing-source"]'), null);

    wrapper.unmount();
    await flushPromises();
  });

  it("scenario D2: blurred list block renders ul/li typography", async () => {
    const wrapper = mountMorphingDocument({ initialValue: LIST_MORPHING_FIXTURE });
    await flushPromises();

    await waitForMorphingDocumentReady();

    const listBlock = queryBlock(1);
    assert.ok(listBlock.querySelector("ul"));
    assert.equal(listBlock.querySelectorAll("li").length, 2);

    wrapper.unmount();
    await flushPromises();
  });

  it("scenario D3: editing list source updates serialized markdown", async () => {
    let latestMarkdown = LIST_MORPHING_FIXTURE;

    const wrapper = mountMorphingDocument({
      initialValue: LIST_MORPHING_FIXTURE,
      onChange: (next: string) => {
        latestMarkdown = next;
      },
    });
    await flushPromises();

    await waitForMorphingDocumentReady();

    const listBlock = queryBlock(1);
    const renderedList = listBlock.querySelector(
      '[data-testid="morphing-rendered"]',
    ) as HTMLElement;

    renderedList.focus();
    await flushPromises();

    await waitFor(() => {
      assert.ok(listBlock.querySelector('[data-testid="morphing-source"]'));
    });

    const source = listBlock.querySelector(
      '[data-testid="morphing-source"]',
    ) as HTMLTextAreaElement;

    dispatchSourceInput(source, "- one\n- two\n- three");

    await waitFor(() => {
      assert.match(latestMarkdown, /- one/);
      assert.match(latestMarkdown, /- three/);
      assert.match(latestMarkdown, /Intro paragraph/);
    });

    wrapper.unmount();
    await flushPromises();
  });

  it("scenario D4: only list block in source during Block Focus", async () => {
    const wrapper = mountMorphingDocument({ initialValue: LIST_MORPHING_FIXTURE });
    await flushPromises();

    await waitForMorphingDocumentReady();

    const listBlock = queryBlock(1);
    const renderedList = listBlock.querySelector(
      '[data-testid="morphing-rendered"]',
    ) as HTMLElement;

    renderedList.focus();
    await flushPromises();

    await waitFor(() => {
      assert.equal(document.querySelectorAll('[data-testid="morphing-source"]').length, 1);
    });

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
